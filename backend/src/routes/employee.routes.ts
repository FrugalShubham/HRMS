import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, requireFeature } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { Employee, Company, User, EmployeeDocument } from '../models';
import { hashPassword } from '../services/auth.password';
import * as subscriptionService from '../services/subscription.service';
import { NotFoundError, ValidationError } from '../utils/errors';
import { getTenantFilter, TenantRequest } from '../middleware/tenant';

const router = Router();
router.use(authenticate, tenantMiddleware);

const employeeSchema = z.object({
  employeeNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  whatsappNumber: z.string().optional(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  managerId: z.string().optional(),
  shiftId: z.string().optional(),
  joinDate: z.coerce.date(),
  password: z.string().min(8).optional(),
});

router.get(
  '/',
  authorize('employees.read'),
  asyncHandler(async (req: TenantRequest, res) => {
    const filter = getTenantFilter(req);
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const query: Record<string, unknown> = { ...filter, status: { $ne: 'terminated' } };

    if (req.user?.role === 'team_manager' && req.user.employeeId) {
      query.managerId = req.user.employeeId;
    }
    if (req.user?.role === 'employee') {
      query._id = req.user.employeeId;
    }

    const [data, total] = await Promise.all([
      Employee.find(query)
        .populate('departmentId designationId managerId')
        .skip((page - 1) * limit)
        .limit(limit),
      Employee.countDocuments(query),
    ]);
    res.json({ success: true, data, meta: { total, page, limit } });
  })
);

router.post(
  '/',
  authorize('employees.create'),
  validate(employeeSchema),
  asyncHandler(async (req: TenantRequest, res) => {
    const companyId = req.tenantId!;
    await subscriptionService.enforceEmployeeLimit(companyId);

    let userId;
    if (req.body.password) {
      const user = await User.create({
        email: req.body.email,
        passwordHash: await hashPassword(req.body.password),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: 'employee',
        companyId,
        isActive: true,
      });
      userId = user._id;
    }

    const employee = await Employee.create({ ...req.body, companyId, userId });
    if (userId) {
      await User.findByIdAndUpdate(userId, { employeeId: employee._id });
    }
    await Company.findByIdAndUpdate(companyId, { $inc: { employeeCount: 1 } });
    res.status(201).json({ success: true, data: employee });
  })
);

router.get(
  '/:id',
  authorize('employees.read'),
  asyncHandler(async (req: TenantRequest, res) => {
    const employee = await Employee.findOne({ _id: req.params.id, ...getTenantFilter(req) });
    if (!employee) throw new NotFoundError();
    res.json({ success: true, data: employee });
  })
);

router.patch(
  '/:id',
  authorize('employees.update'),
  asyncHandler(async (req: TenantRequest, res) => {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, ...getTenantFilter(req) },
      req.body,
      { new: true }
    );
    if (!employee) throw new NotFoundError();
    res.json({ success: true, data: employee });
  })
);

router.delete(
  '/:id',
  authorize('employees.delete'),
  asyncHandler(async (req: TenantRequest, res) => {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, ...getTenantFilter(req) },
      { status: 'terminated' },
      { new: true }
    );
    if (!employee) throw new NotFoundError();
    await Company.findByIdAndUpdate(req.tenantId, { $inc: { employeeCount: -1 } });
    res.json({ success: true, data: employee });
  })
);

router.get(
  '/:id/documents',
  authorize('employees.read'),
  asyncHandler(async (req: TenantRequest, res) => {
    const docs = await EmployeeDocument.find({
      employeeId: req.params.id,
      companyId: req.tenantId,
    });
    res.json({ success: true, data: docs });
  })
);

router.post(
  '/:id/documents',
  authorize('employees.update'),
  validate(z.object({ name: z.string(), type: z.enum(['resume', 'id_proof', 'contract', 'certificate', 'other']), fileUrl: z.string().url() })),
  asyncHandler(async (req: TenantRequest, res) => {
    const doc = await EmployeeDocument.create({
      companyId: req.tenantId,
      employeeId: req.params.id,
      name: req.body.name,
      type: req.body.type,
      fileUrl: req.body.fileUrl,
      uploadedBy: req.user!.id,
    });
    res.status(201).json({ success: true, data: doc });
  })
);

export default router;
