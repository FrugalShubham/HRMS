import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireSuperAdmin } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import * as platformService from '../services/platform.service';
import { Company, Plan, Payment, Invoice } from '../models';
import * as subscriptionService from '../services/subscription.service';

const router = Router();
router.use(authenticate, requireSuperAdmin);

const createCompanySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8),
  ownerFirstName: z.string(),
  ownerLastName: z.string(),
  planSlug: z.string().optional(),
});

router.get(
  '/companies',
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const [data, total] = await Promise.all([
      Company.find({ status: { $ne: 'deleted' } })
        .populate('planId', 'name slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Company.countDocuments({ status: { $ne: 'deleted' } }),
    ]);
    res.json({ success: true, data, meta: { total, page, limit } });
  })
);

router.post(
  '/companies',
  validate(createCompanySchema),
  asyncHandler(async (req, res) => {
    const result = await platformService.createCompany(req.body);
    res.status(201).json({ success: true, data: result });
  })
);

router.patch(
  '/companies/:id/suspend',
  asyncHandler(async (req, res) => {
    const company = await platformService.updateCompanyStatus(String(req.params.id), 'suspended');
    res.json({ success: true, data: company });
  })
);

router.patch(
  '/companies/:id/activate',
  asyncHandler(async (req, res) => {
    const company = await platformService.updateCompanyStatus(String(req.params.id), 'active');
    res.json({ success: true, data: company });
  })
);

router.delete(
  '/companies/:id',
  asyncHandler(async (req, res) => {
    const company = await platformService.updateCompanyStatus(String(req.params.id), 'deleted');
    res.json({ success: true, data: company });
  })
);

router.get(
  '/analytics',
  asyncHandler(async (_req, res) => {
    const data = await platformService.getPlatformAnalytics();
    res.json({ success: true, data });
  })
);

router.get(
  '/plans',
  asyncHandler(async (_req, res) => {
    const plans = await Plan.find().sort({ sortOrder: 1 });
    res.json({ success: true, data: plans });
  })
);

router.patch(
  '/plans/:id/features',
  validate(z.object({ features: z.record(z.boolean()) })),
  asyncHandler(async (req, res) => {
    const plan = await platformService.updatePlanFeatures(String(req.params.id), req.body.features);
    res.json({ success: true, data: plan });
  })
);

router.patch(
  '/companies/:id/credits',
  validate(z.object({ aiCredits: z.number().optional(), whatsappCredits: z.number().optional() })),
  asyncHandler(async (req, res) => {
    const company = await platformService.adjustCredits(
      String(req.params.id),
      req.body.aiCredits,
      req.body.whatsappCredits
    );
    res.json({ success: true, data: company });
  })
);

router.get(
  '/payments',
  asyncHandler(async (req, res) => {
    const payments = await Payment.find()
      .populate('companyId', 'name slug')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: payments });
  })
);

router.patch(
  '/companies/:id/plan',
  validate(z.object({ planId: z.string(), features: z.record(z.boolean()).optional() })),
  asyncHandler(async (req, res) => {
    const result = await subscriptionService.assignPlanBySuperAdmin(
      String(req.params.id),
      req.body.planId,
      req.body.features
    );
    res.json({ success: true, data: result });
  })
);

router.get(
  '/invoices',
  asyncHandler(async (_req, res) => {
    const invoices = await Invoice.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: invoices });
  })
);

export default router;
