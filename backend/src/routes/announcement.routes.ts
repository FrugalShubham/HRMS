import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { Announcement } from '../models';

const router = Router();
router.use(authenticate, tenantMiddleware);

router.get('/', asyncHandler(async (req: TenantRequest, res) => {
  const data = await Announcement.find({ companyId: req.tenantId, status: 'published' }).sort({ publishedAt: -1 });
  res.json({ success: true, data });
}));

router.post('/', authorize('announcements.manage'), validate(z.object({
  title: z.string(), content: z.string(), sendWhatsapp: z.boolean().optional(), sendEmail: z.boolean().optional(),
  scheduledAt: z.coerce.date().optional(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const status = req.body.scheduledAt ? 'scheduled' : 'published';
  const a = await Announcement.create({
    ...req.body,
    companyId: req.tenantId,
    createdBy: req.user!.id,
    status,
    publishedAt: status === 'published' ? new Date() : undefined,
  });
  res.status(201).json({ success: true, data: a });
}));

export default router;
