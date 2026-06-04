import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as whatsappService from '../services/whatsapp.service';
import { env } from '../config/env';

const router = Router();

router.get('/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;
  whatsappService.verifyWebhook(mode, token, challenge).then((result) => {
    if (result) res.status(200).send(result);
    else res.sendStatus(403);
  });
});

router.post('/whatsapp', asyncHandler(async (req, res) => {
  const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];
  if (!message) {
    res.sendStatus(200);
    return;
  }
  const from = message.from;
  const text = message.text?.body ?? '';
  const location = message.location
    ? { latitude: message.location.latitude, longitude: message.location.longitude }
    : undefined;
  await whatsappService.handleIncomingMessage(from, text, location);
  res.sendStatus(200);
}));

router.post('/razorpay', asyncHandler(async (req, res) => {
  // Webhook signature verification in production
  console.log('Razorpay webhook', req.body.event);
  res.json({ received: true });
}));

export default router;
