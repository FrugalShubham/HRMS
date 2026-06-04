import crypto from 'crypto';

export function generateOtp(length = 6): string {
  const max = Math.pow(10, length) - 1;
  const num = crypto.randomInt(0, max + 1);
  return num.toString().padStart(length, '0');
}

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
