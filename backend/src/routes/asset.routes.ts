import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, requireFeature, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { Asset } from '../models';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate, tenantMiddleware, requireFeature('assetManagement'), authorize('assets.manage'));

router.get('/', asyncHandler(async (req: TenantRequest, res) => {
  const data = await Asset.find({ companyId: req.tenantId });
  res.json({ success: true, data });
}));

router.post('/', validate(z.object({
  name: z.string(),
  type: z.enum(['laptop', 'desktop', 'mobile', 'id_card', 'accessories', 'other']),
  serialNumber: z.string().optional(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const a = await Asset.create({ ...req.body, companyId: req.tenantId });
  res.status(201).json({ success: true, data: a });
}));

router.post('/:id/allocate', validate(z.object({ employeeId: z.string() })), asyncHandler(async (req: TenantRequest, res) => {
  const asset = await Asset.findOne({ _id: req.params.id, companyId: req.tenantId });
  if (!asset) throw new NotFoundError();
  asset.allocations.push({ employeeId: req.body.employeeId, allocatedAt: new Date(), condition: 'good' });
  asset.status = 'allocated';
  await asset.save();
  res.json({ success: true, data: asset });
}));

export default router;
