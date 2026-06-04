import { OtpVerification, IOtpVerification } from '../models/OtpVerification';
import { User } from '../models';
import { generateOtp, hashToken } from '../utils/tokens';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service';
import { sendWhatsAppMessage } from './whatsapp.service';
import { OtpPurpose } from '../models/OtpVerification';

const OTP_EXPIRY_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function createOtp(params: {
  purpose: OtpPurpose;
  userId?: string;
  email?: string;
  phone?: string;
  sendVia?: 'email' | 'whatsapp' | 'sms';
}): Promise<{ expiresAt: Date; devCode?: string }> {
  const code = generateOtp(6);
  const codeHash = hashToken(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await OtpVerification.deleteMany({
    purpose: params.purpose,
    ...(params.email ? { email: params.email.toLowerCase() } : {}),
    ...(params.phone ? { phone: params.phone } : {}),
    ...(params.userId ? { userId: params.userId } : {}),
  });

  await OtpVerification.create({
    userId: params.userId,
    email: params.email?.toLowerCase(),
    phone: params.phone,
    purpose: params.purpose,
    codeHash,
    expiresAt,
  });

  if (params.purpose === 'email_verify' && params.email) {
    await sendVerificationEmail(params.email, code);
  }
  if (params.purpose === 'password_reset' && params.email) {
    await sendPasswordResetEmail(params.email, code);
  }
  if (params.sendVia === 'whatsapp' && params.phone) {
    await sendWhatsAppMessage(params.phone, `HRFlow verification code: ${code}`);
  }

  return {
    expiresAt,
    devCode: process.env.NODE_ENV === 'development' ? code : undefined,
  };
}

export async function verifyOtp(params: {
  purpose: OtpPurpose;
  code: string;
  email?: string;
  phone?: string;
  userId?: string;
}): Promise<IOtpVerification> {
  const query: Record<string, unknown> = {
    purpose: params.purpose,
    verified: false,
    expiresAt: { $gt: new Date() },
  };
  if (params.email) query.email = params.email.toLowerCase();
  if (params.phone) query.phone = params.phone;
  if (params.userId) query.userId = params.userId;

  const record = await OtpVerification.findOne(query).sort({ createdAt: -1 });
  if (!record) throw new ValidationError('Invalid or expired OTP');

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new UnauthorizedError('OTP attempts exceeded. Request a new code.');
  }

  const valid = hashToken(params.code) === record.codeHash;
  record.attempts += 1;
  if (!valid) {
    await record.save();
    throw new ValidationError('Invalid OTP');
  }

  record.verified = true;
  await record.save();
  return record;
}

export async function markEmailVerified(userId: string) {
  await User.findByIdAndUpdate(userId, { emailVerified: true });
}

export async function markPhoneVerified(userId: string) {
  await User.findByIdAndUpdate(userId, { phoneVerified: true });
}

export async function markWhatsappVerified(userId: string) {
  await User.findByIdAndUpdate(userId, { whatsappVerified: true });
}
