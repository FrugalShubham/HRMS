import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { Company } from '../models';
import * as subscriptionService from '../services/subscription.service';

const router = Router();
router.use(authenticate, tenantMiddleware);

router.get('/', authorize('company.settings'), asyncHandler(async (req: TenantRequest, res) => {
  const company = await Company.findById(req.tenantId).populate('planId');
  res.json({ success: true, data: company });
}));

router.patch(
  '/',
  authorize('company.settings'),
  validate(
    z.object({
      name: z.string().optional(),
      address: z.string().optional(),
      settings: z
        .object({
          requirePhoto: z.boolean().optional(),
          officeRadius: z.number().optional(),
          timezone: z.string().optional(),
        })
        .optional(),
      officeLocation: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
      whiteLabel: z
        .object({
          brandName: z.string().optional(),
          logoUrl: z.string().optional(),
          primaryColor: z.string().optional(),
        })
        .optional(),
    })
  ),
  asyncHandler(async (req: TenantRequest, res) => {
    const update: Record<string, unknown> = { ...req.body };
    if (req.body.officeLocation) {
      update.officeLocation = {
        type: 'Point',
        coordinates: [req.body.officeLocation.longitude, req.body.officeLocation.latitude],
      };
    }
    const company = await Company.findByIdAndUpdate(req.tenantId, update, { new: true });
    res.json({ success: true, data: company });
  })
);

router.get('/subscription', authorize('company.settings'), asyncHandler(async (req: TenantRequest, res) => {
  const sub = await subscriptionService.getCompanySubscription(req.tenantId!);
  res.json({ success: true, data: sub });
}));

router.get('/billing-history', authorize('company.settings'), asyncHandler(async (req: TenantRequest, res) => {
  const data = await subscriptionService.getBillingHistory(req.tenantId!);
  res.json({ success: true, data });
}));

router.post(
  '/upgrade',
  authorize('company.settings'),
  validate(z.object({ planId: z.string() })),
  asyncHandler(async (req: TenantRequest, res) => {
    const result = await subscriptionService.upgradePlan(req.tenantId!, req.body.planId);
    res.json({ success: true, data: result });
  })
);

export default router;
