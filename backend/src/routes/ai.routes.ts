import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../middleware/auth';
import { tenantMiddleware, requireFeature, TenantRequest } from '../middleware/tenant';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import * as aiService from '../services/ai.service';

const router = Router();
router.use(authenticate, tenantMiddleware, requireFeature('aiAssistant'), authorize('ai.use'));

router.post('/chat', validate(z.object({ message: z.string(), context: z.string().optional() })), asyncHandler(async (req: TenantRequest, res) => {
  const reply = await aiService.hrAssistant(req.tenantId!, req.body.message, req.body.context);
  res.json({ success: true, data: { reply } });
}));

router.get('/attendance-insights', asyncHandler(async (req: TenantRequest, res) => {
  const data = await aiService.attendanceInsights(req.tenantId!, Number(req.query.days) || 30);
  res.json({ success: true, data });
}));

router.get('/attrition', asyncHandler(async (req: TenantRequest, res) => {
  const data = await aiService.attritionPrediction(req.tenantId!);
  res.json({ success: true, data });
}));

export default router;
