import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, requireFeature, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import * as attendanceService from '../services/attendance.service';

const router = Router();
router.use(authenticate, tenantMiddleware, requireFeature('attendance'));

const checkSchema = z.object({
  location: z.object({ latitude: z.number(), longitude: z.number(), accuracy: z.number().optional() }).optional(),
  selfieUrl: z.string().url().optional(),
  deviceInfo: z.object({ userAgent: z.string().optional(), platform: z.string().optional() }).optional(),
});

router.post(
  '/check-in',
  authorize('attendance.mark.self'),
  validate(checkSchema),
  asyncHandler(async (req: TenantRequest, res) => {
    const employeeId = req.user!.employeeId!;
    const data = await attendanceService.checkIn({
      companyId: req.tenantId!,
      employeeId,
      source: (req.headers['x-client'] as 'web' | 'mobile') ?? 'web',
      record: {
        ...req.body,
        ipAddress: req.ip,
        deviceInfo: req.body.deviceInfo ?? { userAgent: req.get('user-agent') ?? undefined },
      },
    });
    res.json({ success: true, data });
  })
);

router.post(
  '/check-out',
  authorize('attendance.mark.self'),
  validate(checkSchema),
  asyncHandler(async (req: TenantRequest, res) => {
    const data = await attendanceService.checkOut({
      companyId: req.tenantId!,
      employeeId: req.user!.employeeId!,
      source: (req.headers['x-client'] as 'web' | 'mobile') ?? 'web',
      record: { ...req.body, ipAddress: req.ip },
    });
    res.json({ success: true, data });
  })
);

router.get(
  '/my',
  authorize('attendance.mark.self'),
  asyncHandler(async (req: TenantRequest, res) => {
    const result = await attendanceService.listAttendance(req.tenantId!, {
      employeeId: req.user!.employeeId,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, ...result });
  })
);

router.get(
  '/',
  authorize('attendance.read.all'),
  asyncHandler(async (req: TenantRequest, res) => {
    const result = await attendanceService.listAttendance(req.tenantId!, {
      employeeId: req.query.employeeId as string | undefined,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json({ success: true, ...result });
  })
);

export default router;
