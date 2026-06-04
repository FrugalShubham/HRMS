import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { processTrialReminders } from '../services/registration.service';

const router = Router();

/** Cron endpoint — protect with super admin or X-Cron-Secret in production */
router.post(
  '/trial-reminders',
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (_req, res) => {
    const result = await processTrialReminders();
    res.json({ success: true, data: result });
  })
);

export default router;
