import { randomInt } from 'node:crypto';

export function generateOTP(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += chars.charAt(randomInt(chars.length));
  }

  return otp;
}
