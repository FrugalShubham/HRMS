import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { tenantMiddleware, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import * as paymentService from '../services/payment.service';
import { Plan, Subscription } from '../models';

const router = Router();

router.get('/plans', asyncHandler(async (_req, res) => {
  const plans = await Plan.find({ isActive: true, isCustom: false }).sort({ sortOrder: 1 });
  res.json({ success: true, data: plans });
}));

router.use(authenticate, tenantMiddleware);

router.get('/subscription', asyncHandler(async (req: TenantRequest, res) => {
  const sub = await Subscription.findOne({ companyId: req.tenantId }).populate('planId');
  res.json({ success: true, data: sub });
}));

router.post('/razorpay/order', validate(z.object({ planId: z.string() })), asyncHandler(async (req: TenantRequest, res) => {
  const data = await paymentService.createRazorpayOrder(req.tenantId!, req.body.planId);
  res.json({ success: true, data });
}));

router.post('/razorpay/verify', validate(z.object({
  planId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const data = await paymentService.verifyRazorpayPayment({
    companyId: req.tenantId!,
    ...req.body,
  });
  res.json({ success: true, data });
}));

router.post('/stripe/checkout', validate(z.object({ planId: z.string() })), asyncHandler(async (req: TenantRequest, res) => {
  const data = await paymentService.createStripeCheckoutSession(req.tenantId!, req.body.planId);
  res.json({ success: true, data });
}));

export default router;
