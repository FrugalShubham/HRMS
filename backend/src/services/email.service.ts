import { env } from '../config/env';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Email transport — logs in dev; plug SES/SendGrid in production */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (env.NODE_ENV === 'production' && !process.env.SMTP_HOST) {
    console.warn('[Email] SMTP not configured — skipping send to', payload.to);
    return;
  }

  console.log(`[Email] To: ${payload.to} | Subject: ${payload.subject}`);
  if (env.NODE_ENV === 'development') {
    console.log(payload.text ?? payload.html.slice(0, 200));
  }
}

export async function sendVerificationEmail(email: string, code: string) {
  await sendEmail({
    to: email,
    subject: 'Verify your HRFlow AI account',
    html: `<p>Your verification code is: <strong>${code}</strong></p><p>Valid for 15 minutes.</p>`,
    text: `Your verification code is: ${code}`,
  });
}

export async function sendPasswordResetEmail(email: string, code: string) {
  await sendEmail({
    to: email,
    subject: 'Reset your HRFlow AI password',
    html: `<p>Your password reset code is: <strong>${code}</strong></p>`,
    text: `Reset code: ${code}`,
  });
}

export async function sendTrialExpiryReminder(email: string, companyName: string, daysLeft: number) {
  await sendEmail({
    to: email,
    subject: `HRFlow trial ending in ${daysLeft} day(s)`,
    html: `<p>Hi,</p><p>Your trial for <strong>${companyName}</strong> expires in ${daysLeft} day(s). <a href="${env.FRONTEND_URL}/billing">Upgrade now</a>.</p>`,
  });
}
