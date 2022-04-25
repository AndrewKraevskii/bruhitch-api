import { createHmac } from 'crypto';
import { Environment } from '../types/env';
import getEnv from './getEnv';

export const hashSHA256 = (v: string) =>
  createHmac('sha256', getEnv(Environment.SecretKey)).update(v).digest('hex');
