import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { tenantMiddleware, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import * as s3Service from '../services/s3.service';

const router = Router();
router.use(authenticate, tenantMiddleware);

router.post('/presign', validate(z.object({
  folder: z.enum(['selfies', 'resumes', 'documents']),
  contentType: z.string(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const data = await s3Service.getUploadPresignedUrl(req.tenantId!, req.body.folder, req.body.contentType);
  res.json({ success: true, data });
}));

export default router;
