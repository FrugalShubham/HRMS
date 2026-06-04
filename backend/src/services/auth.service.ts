import bcrypt from 'bcryptjs';
import { User } from '../models';
import { LoginHistory } from '../models/LoginHistory';
import { UserDevice } from '../models/UserDevice';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { UnauthorizedError, ValidationError, ForbiddenError } from '../utils/errors';
import { JwtPayload } from '../types';
import { createOtp, verifyOtp, markEmailVerified } from './otp.service';
import { hashPassword as hash, comparePassword } from './auth.password';

export { hashPassword, comparePassword } from './auth.password';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000;

export interface LoginContext {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
}

async function recordLogin(
  userId: string | null,
  email: string,
  success: boolean,
  ctx: LoginContext,
  companyId?: string,
  failureReason?: string
) {
  await LoginHistory.create({
    userId: userId ?? undefined,
    companyId,
    email,
    success,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
    deviceId: ctx.deviceId,
    failureReason,
  });
}

async function trackDevice(userId: string, ctx: LoginContext) {
  if (!ctx.deviceId) return;
  await UserDevice.findOneAndUpdate(
    { userId, deviceId: ctx.deviceId },
    {
      deviceName: ctx.deviceName,
      platform: ctx.platform,
      browser: ctx.browser,
      ipAddress: ctx.ipAddress,
      lastActiveAt: new Date(),
    },
    { upsert: true, new: true }
  );
}

function isAccountLocked(user: { lockedUntil?: Date }): boolean {
  return !!user.lockedUntil && user.lockedUntil > new Date();
}

async function handleFailedLogin(user: InstanceType<typeof User>) {
  user.failedLoginAttempts += 1;
  if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
  }
  await user.save();
}

function buildTokens(user: InstanceType<typeof User>) {
  const payload: JwtPayload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    companyId: user.companyId?.toString(),
    employeeId: user.employeeId?.toString(),
  };
  return {
    payload,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ ...payload, version: user.refreshTokenVersion }),
  };
}

export async function login(email: string, password: string, ctx: LoginContext = {}, otpCode?: string) {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +mfaSecret');

  if (!user) {
    await recordLogin(null, normalizedEmail, false, ctx, undefined, 'user_not_found');
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.isActive) {
    await recordLogin(user._id.toString(), normalizedEmail, false, ctx, user.companyId?.toString(), 'inactive');
    throw new ForbiddenError('Account is disabled');
  }

  if (isAccountLocked(user)) {
    await recordLogin(user._id.toString(), normalizedEmail, false, ctx, user.companyId?.toString(), 'locked');
    throw new ForbiddenError('Account temporarily locked. Try again later.');
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    await handleFailedLogin(user);
    await recordLogin(user._id.toString(), normalizedEmail, false, ctx, user.companyId?.toString(), 'bad_password');
    throw new UnauthorizedError('Invalid credentials');
  }

  if (user.mfaEnabled) {
    if (!otpCode) {
      const otp = await createOtp({
        purpose: 'login_2fa',
        userId: user._id.toString(),
        email: user.email,
      });
      return {
        requires2fa: true,
        expiresAt: otp.expiresAt,
        devCode: otp.devCode,
      };
    }
    await verifyOtp({ purpose: 'login_2fa', code: otpCode, userId: user._id.toString(), email: user.email });
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();
  await trackDevice(user._id.toString(), ctx);
  await recordLogin(user._id.toString(), normalizedEmail, true, ctx, user.companyId?.toString());

  const { accessToken, refreshToken } = buildTokens(user);

  return {
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      employeeId: user.employeeId,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive || user.refreshTokenVersion !== payload.version) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const tokens = buildTokens(user);
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export async function logout(userId: string) {
  await User.findByIdAndUpdate(userId, { $inc: { refreshTokenVersion: 1 } });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new UnauthorizedError();

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Current password is incorrect');

  user.passwordHash = await hash(newPassword);
  user.passwordChangedAt = new Date();
  user.refreshTokenVersion += 1;
  await user.save();
}

export async function forgotPassword(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return { message: 'If the email exists, a reset code has been sent' };
  }
  const otp = await createOtp({ purpose: 'password_reset', userId: user._id.toString(), email: user.email });
  return { message: 'If the email exists, a reset code has been sent', devCode: otp.devCode };
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  const normalized = email.toLowerCase();
  await verifyOtp({ purpose: 'password_reset', code, email: normalized });
  const user = await User.findOne({ email: normalized }).select('+passwordHash');
  if (!user) throw new ValidationError('User not found');

  user.passwordHash = await hash(newPassword);
  user.passwordChangedAt = new Date();
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  user.refreshTokenVersion += 1;
  await user.save();
}

export async function verifyEmail(userId: string, code: string) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError();
  await verifyOtp({ purpose: 'email_verify', code, userId, email: user.email });
  await markEmailVerified(userId);
  return user;
}

export async function resendVerificationEmail(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError();
  if (user.emailVerified) throw new ValidationError('Email already verified');
  return createOtp({ purpose: 'email_verify', userId, email: user.email });
}

export async function enableTwoFactor(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError();
  user.mfaEnabled = true;
  await user.save();
  return { mfaEnabled: true };
}

export async function disableTwoFactor(userId: string, password: string) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new UnauthorizedError();
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid password');
  user.mfaEnabled = false;
  await user.save();
}

export async function getLoginHistory(userId: string, limit = 20) {
  return LoginHistory.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

export async function getUserDevices(userId: string) {
  return UserDevice.find({ userId }).sort({ lastActiveAt: -1 });
}

export async function sendPhoneOtp(userId: string, phone: string) {
  const user = await User.findById(userId);
  if (!user) throw new UnauthorizedError();
  user.phone = phone;
  await user.save();
  return createOtp({ purpose: 'phone_verify', userId, phone, sendVia: 'sms' });
}

export async function verifyPhoneOtp(userId: string, phone: string, code: string) {
  await verifyOtp({ purpose: 'phone_verify', code, userId, phone });
  await User.findByIdAndUpdate(userId, { phoneVerified: true, phone });
}

export async function sendWhatsappOtp(userId: string, whatsappNumber: string) {
  return createOtp({
    purpose: 'whatsapp_verify',
    userId,
    phone: whatsappNumber,
    sendVia: 'whatsapp',
  });
}

export async function verifyWhatsappOtp(userId: string, phone: string, code: string) {
  await verifyOtp({ purpose: 'whatsapp_verify', code, userId, phone });
  await User.findByIdAndUpdate(userId, { whatsappVerified: true });
}
