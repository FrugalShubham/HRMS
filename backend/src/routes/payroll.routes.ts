import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, requireFeature, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import * as payrollService from '../services/payroll.service';
import { Payroll, Payslip } from '../models';

const router = Router();
router.use(authenticate, tenantMiddleware, requireFeature('payroll'));

router.post('/generate', authorize('payroll.manage'), validate(z.object({
  month: z.number().min(1).max(12), year: z.number(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const data = await payrollService.generatePayroll({
    companyId: req.tenantId!,
    month: req.body.month,
    year: req.body.year,
    userId: req.user!.id,
  });
  res.json({ success: true, data });
}));

router.get('/', authorize('payroll.manage'), asyncHandler(async (req: TenantRequest, res) => {
  const data = await Payroll.find({ companyId: req.tenantId }).sort({ year: -1, month: -1 });
  res.json({ success: true, data });
}));

router.get('/payslips', authorize('payroll.manage', 'payroll.view.self'), asyncHandler(async (req: TenantRequest, res) => {
  const query: Record<string, unknown> = { companyId: req.tenantId };
  if (req.user?.role === 'employee') query.employeeId = req.user.employeeId;
  const data = await Payslip.find(query).populate('employeeId').sort({ year: -1, month: -1 });
  res.json({ success: true, data });
}));

router.get('/payslips/:id', authorize('payroll.view.self', 'payroll.manage'), asyncHandler(async (req: TenantRequest, res) => {
  const data = await payrollService.getPayslip(
    req.tenantId!,
    String(req.params.id),
    req.user?.role === 'employee' ? req.user.employeeId : undefined
  );
  res.json({ success: true, data });
}));

export default router;
