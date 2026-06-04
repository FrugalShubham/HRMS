import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, getTenantFilter, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { Department, Designation } from '../models';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate, tenantMiddleware, authorize('departments.manage'));

router.get('/', asyncHandler(async (req: TenantRequest, res) => {
  const data = await Department.find(getTenantFilter(req));
  res.json({ success: true, data });
}));

router.post('/', validate(z.object({ name: z.string(), code: z.string().optional(), description: z.string().optional() })), asyncHandler(async (req: TenantRequest, res) => {
  const dept = await Department.create({ ...req.body, companyId: req.tenantId });
  res.status(201).json({ success: true, data: dept });
}));

router.get('/designations/list', asyncHandler(async (req: TenantRequest, res) => {
  const data = await Designation.find(getTenantFilter(req));
  res.json({ success: true, data });
}));

router.post('/designations/list', validate(z.object({ name: z.string(), level: z.number().optional() })), asyncHandler(async (req: TenantRequest, res) => {
  const d = await Designation.create({ ...req.body, companyId: req.tenantId });
  res.status(201).json({ success: true, data: d });
}));

export default router;
