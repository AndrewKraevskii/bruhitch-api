import { createHmac } from 'crypto';

export const hashSHA256 = (v: string) =>
  createHmac('sha256', process.env.SECRET_KEY).update(v).digest('hex');
