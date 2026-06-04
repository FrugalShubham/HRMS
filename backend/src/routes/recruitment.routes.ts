import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, requireFeature, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { Recruitment, Candidate } from '../models';
import * as aiService from '../services/ai.service';

const router = Router();
router.use(authenticate, tenantMiddleware, requireFeature('recruitment'));

router.get('/jobs', authorize('recruitment.manage'), asyncHandler(async (req: TenantRequest, res) => {
  const data = await Recruitment.find({ companyId: req.tenantId });
  res.json({ success: true, data });
}));

router.post('/jobs', authorize('recruitment.manage'), validate(z.object({
  title: z.string(), description: z.string(), requirements: z.array(z.string()).optional(), openings: z.number().optional(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const job = await Recruitment.create({ ...req.body, companyId: req.tenantId });
  res.status(201).json({ success: true, data: job });
}));

router.get('/candidates', authorize('recruitment.manage'), asyncHandler(async (req: TenantRequest, res) => {
  const query: Record<string, unknown> = { companyId: req.tenantId };
  if (req.query.recruitmentId) query.recruitmentId = req.query.recruitmentId;
  const data = await Candidate.find(query);
  res.json({ success: true, data });
}));

router.post('/candidates', validate(z.object({
  recruitmentId: z.string(), firstName: z.string(), lastName: z.string(), email: z.string().email(),
  phone: z.string(), resumeText: z.string().optional(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const c = await Candidate.create({ ...req.body, companyId: req.tenantId });
  res.status(201).json({ success: true, data: c });
}));

router.post('/candidates/:id/screen', authorize('recruitment.manage', 'ai.use'), validate(z.object({
  jobDescription: z.string(),
})), asyncHandler(async (req: TenantRequest, res) => {
  const result = await aiService.screenResume(req.tenantId!, String(req.params.id), req.body.jobDescription);
  res.json({ success: true, data: result });
}));

export default router;
