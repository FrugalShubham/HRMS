import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, requireFeature, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import * as leaveService from '../services/leave.service';
import { LeaveRequest, LeaveType } from '../models';

const router = Router();
router.use(authenticate, tenantMiddleware, requireFeature('leave'));

router.get('/types', asyncHandler(async (req: TenantRequest, res) => {
  const types = await LeaveType.find({ companyId: req.tenantId, isActive: true });
  res.json({ success: true, data: types });
}));

router.post('/types', authorize('leave.manage'), validate(z.object({
  name: z.string(), code: z.string(), annualQuota: z.number(), isPaid: z.boolean().optional(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const t = await LeaveType.create({ ...req.body, companyId: req.tenantId });
  res.status(201).json({ success: true, data: t });
}));

router.get('/balances', authorize('leave.request'), asyncHandler(async (req: TenantRequest, res) => {
  const employeeId = (req.query.employeeId as string) || req.user!.employeeId!;
  const year = Number(req.query.year) || new Date().getFullYear();
  const data = await leaveService.getLeaveBalances(req.tenantId!, employeeId, year);
  res.json({ success: true, data });
}));

router.post('/requests', authorize('leave.request'), validate(z.object({
  leaveTypeId: z.string(), startDate: z.coerce.date(), endDate: z.coerce.date(), reason: z.string(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const data = await leaveService.createLeaveRequest({
    companyId: req.tenantId!,
    employeeId: req.user!.employeeId!,
    ...req.body,
  });
  res.status(201).json({ success: true, data });
}));

router.get('/requests', authorize('leave.manage', 'leave.request'), asyncHandler(async (req: TenantRequest, res) => {
  const query: Record<string, unknown> = { companyId: req.tenantId };
  if (req.user?.role === 'employee') query.employeeId = req.user.employeeId;
  const data = await LeaveRequest.find(query).populate('leaveTypeId employeeId').sort({ createdAt: -1 });
  res.json({ success: true, data });
}));

router.patch('/requests/:id/approve', authorize('leave.approve.manager', 'leave.approve.hr'), validate(z.object({
  approved: z.boolean(), comment: z.string().optional(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const role = req.user!.role === 'team_manager' ? 'team_manager' : 'hr_manager';
  const data = await leaveService.approveLeave({
    requestId: req.params.id,
    companyId: req.tenantId!,
    approverId: req.user!.id,
    role: role as 'team_manager' | 'hr_manager',
    ...req.body,
  });
  res.json({ success: true, data });
}));

export default router;
