import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { Holiday } from '../models';

const router = Router();
router.use(authenticate, tenantMiddleware);

router.get('/', asyncHandler(async (req: TenantRequest, res) => {
  const data = await Holiday.find({ companyId: req.tenantId }).sort({ date: 1 });
  res.json({ success: true, data });
}));

router.post('/', authorize('holidays.manage'), validate(z.object({
  name: z.string(), date: z.coerce.date(), type: z.enum(['national', 'company', 'department']).optional(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const h = await Holiday.create({ ...req.body, companyId: req.tenantId });
  res.status(201).json({ success: true, data: h });
}));

export default router;
