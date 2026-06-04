# Phase 5 — Authentication Module

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | 14-day trial signup |
| POST | `/auth/login` | Public | Login + optional 2FA OTP |
| POST | `/auth/refresh` | Cookie | Rotate tokens |
| POST | `/auth/logout` | Yes | Invalidate sessions |
| GET | `/auth/me` | Yes | User + company features |
| POST | `/auth/forgot-password` | Public | Send reset OTP |
| POST | `/auth/reset-password` | Public | Reset with OTP |
| POST | `/auth/change-password` | Yes | Change password |
| POST | `/auth/verify-email` | Yes | Verify with OTP |
| POST | `/auth/verify-email-public` | Public | Verify after signup |
| POST | `/auth/resend-verification` | Yes | Resend email OTP |
| POST | `/auth/2fa/enable` | Yes | Enable email 2FA |
| POST | `/auth/2fa/disable` | Yes | Disable 2FA |
| POST | `/auth/send-phone-otp` | Yes | Mobile OTP |
| POST | `/auth/verify-phone` | Yes | Verify mobile |
| POST | `/auth/send-whatsapp-otp` | Yes | WhatsApp OTP |
| POST | `/auth/verify-whatsapp` | Yes | Verify WhatsApp |
| GET | `/auth/login-history` | Yes | Audit trail |
| GET | `/auth/devices` | Yes | Device tracking |

## Security

- Account lock after 5 failed attempts (30 min)
- Refresh token rotation via `refreshTokenVersion`
- OTP hashed (SHA-256), 15 min expiry, max 5 attempts
- Rate limit on `/auth/login`

## Frontend Pages

- `/register` — Free trial
- `/login` — 2FA support
- `/forgot-password` / `/reset-password`
- `/verify-email`
- `/settings` — Password, 2FA, devices, login history

## Trial Cron

`POST /api/v1/jobs/trial-reminders` (Super Admin) — sends expiry emails, expires trials, suspends companies.
