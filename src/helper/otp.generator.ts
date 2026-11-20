import { randomInt } from 'node:crypto';

type OTPType = 'alphabet' | 'number' | 'both';

export function generateOTP(length: number, type: OTPType = 'both') {
  const chars = {
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    number: '0123456789',
    both: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  };

  const characters = chars[type];

  let otp = '';

  for (let i = 0; i < length; i++) {
    otp += characters.charAt(randomInt(characters.length));
  }

  return otp;
}
