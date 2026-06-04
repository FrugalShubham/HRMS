import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';
import * as registrationService from '../services/registration.service';
import { User, Company } from '../models';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  otpCode: z.string().optional(),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
});

const registerSchema = z.object({
  companyName: z.string().min(2),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8).regex(/[A-Z]/, 'Need uppercase').regex(/[0-9]/, 'Need number'),
  ownerFirstName: z.string().min(1),
  ownerLastName: z.string().min(1),
  phone: z.string().optional(),
});

function loginContext(req: { ip?: string; get: (h: string) => string | undefined; body?: Record<string, string | undefined> }) {
  return {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    deviceId: req.body?.deviceId,
    deviceName: req.body?.deviceName,
    platform: req.body?.platform,
    browser: req.body?.browser,
  };
}

function setRefreshCookie(res: import('express').Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const result = await registrationService.registerCompanyTrial(req.body);
    res.status(201).json({
      success: true,
      data: {
        company: { id: result.company._id, name: result.company.name, slug: result.company.slug },
        user: result.owner,
        subscription: {
          status: result.subscription.status,
          expiresAt: result.subscription.expiresAt,
        },
        verification: result.verification,
      },
      message: 'Trial started. Verify your email to unlock all features.',
    });
  })
);

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(
      req.body.email,
      req.body.password,
      loginContext(req),
      req.body.otpCode
    );

    if ('requires2fa' in result && result.requires2fa) {
      res.json({ success: true, data: result });
      return;
    }

    setRefreshCookie(res, result.refreshToken!);
    res.json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken ?? req.body.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: 'No refresh token' });
      return;
    }
    const result = await authService.refreshTokens(token);
    setRefreshCookie(res, result.refreshToken);
    res.json({ success: true, data: { accessToken: result.accessToken } });
  })
);

router.post('/logout', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  await authService.logout(req.user!.id);
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out' });
}));

router.get('/me', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await User.findById(req.user!.id).select('-passwordHash -mfaSecret');
  let company = null;
  if (user?.companyId) {
    company = await Company.findById(user.companyId).select('name slug features status planId');
  }
  res.json({ success: true, data: { user, company } });
}));

router.post(
  '/forgot-password',
  validate(z.object({ email: z.string().email() })),
  asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    res.json({ success: true, data: result });
  })
);

router.post(
  '/reset-password',
  validate(z.object({ email: z.string().email(), code: z.string().length(6), newPassword: z.string().min(8) })),
  asyncHandler(async (req, res) => {
    await authService.resetPassword(req.body.email, req.body.code, req.body.newPassword);
    res.json({ success: true, message: 'Password reset successful' });
  })
);

router.post(
  '/change-password',
  authenticate,
  validate(z.object({ currentPassword: z.string(), newPassword: z.string().min(8) })),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    res.json({ success: true, message: 'Password changed' });
  })
);

router.post(
  '/verify-email',
  authenticate,
  validate(z.object({ code: z.string().length(6) })),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await authService.verifyEmail(req.user!.id, req.body.code);
    res.json({ success: true, message: 'Email verified' });
  })
);

router.post(
  '/verify-email-public',
  validate(z.object({ email: z.string().email(), code: z.string().length(6) })),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    await authService.verifyEmail(user._id.toString(), req.body.code);
    res.json({ success: true, message: 'Email verified' });
  })
);

router.post('/resend-verification', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const result = await authService.resendVerificationEmail(req.user!.id);
  res.json({ success: true, data: result });
}));

router.post('/2fa/enable', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const result = await authService.enableTwoFactor(req.user!.id);
  res.json({ success: true, data: result });
}));

router.post(
  '/2fa/disable',
  authenticate,
  validate(z.object({ password: z.string() })),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await authService.disableTwoFactor(req.user!.id, req.body.password);
    res.json({ success: true, message: '2FA disabled' });
  })
);

router.post(
  '/verify-phone',
  authenticate,
  validate(z.object({ phone: z.string(), code: z.string().length(6) })),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await authService.verifyPhoneOtp(req.user!.id, req.body.phone, req.body.code);
    res.json({ success: true, message: 'Phone verified' });
  })
);

router.post(
  '/send-phone-otp',
  authenticate,
  validate(z.object({ phone: z.string() })),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await authService.sendPhoneOtp(req.user!.id, req.body.phone);
    res.json({ success: true, data: result });
  })
);

router.post(
  '/send-whatsapp-otp',
  authenticate,
  validate(z.object({ whatsappNumber: z.string() })),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const result = await authService.sendWhatsappOtp(req.user!.id, req.body.whatsappNumber);
    res.json({ success: true, data: result });
  })
);

router.post(
  '/verify-whatsapp',
  authenticate,
  validate(z.object({ whatsappNumber: z.string(), code: z.string().length(6) })),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await authService.verifyWhatsappOtp(req.user!.id, req.body.whatsappNumber, req.body.code);
    res.json({ success: true, message: 'WhatsApp verified' });
  })
);

router.get('/login-history', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = await authService.getLoginHistory(req.user!.id);
  res.json({ success: true, data });
}));

router.get('/devices', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = await authService.getUserDevices(req.user!.id);
  res.json({ success: true, data });
}));

export default router;
