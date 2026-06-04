import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { Shift } from '../models';

const router = Router();
router.use(authenticate, tenantMiddleware, authorize('shifts.manage'));

router.get('/', asyncHandler(async (req: TenantRequest, res) => {
  const data = await Shift.find({ companyId: req.tenantId, isActive: true });
  res.json({ success: true, data });
}));

router.post('/', validate(z.object({
  name: z.string(), type: z.enum(['morning', 'evening', 'night', 'flexible']),
  startTime: z.string(), endTime: z.string(), graceMinutes: z.number().optional(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const s = await Shift.create({ ...req.body, companyId: req.tenantId });
  res.status(201).json({ success: true, data: s });
}));

export default router;
