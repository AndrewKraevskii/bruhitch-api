import type { User } from '@prisma/client';
import { decodeFromBase64, encodeToBase64 } from './base64';
import { hashSHA256 } from './sha256';

export type Token = { token: string; expiresIn: number };

const accessTokenTimeSpan = 60 * 5; // in seconds. 5 minutes
const refreshTokenTimeSpan = 60 * 60 * 24 * 180; // in seconds. 180 days

export const generateJWTToken = (user: User): Token => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  const headerBase64 = encodeToBase64(JSON.stringify(header)).replace(/=/g, '');
  const payload = {
    ...user,
    iat: Math.floor(new Date().getTime() / 1000),
    eat: Math.floor(new Date(new Date().getTime() + accessTokenTimeSpan * 1000).getTime() / 1000)
  };
  const payloadBase64 = encodeToBase64(JSON.stringify(payload)).replace(/=/g, '');
  const signature = hashSHA256(`${headerBase64}.${payloadBase64}`);
  return {
    token: `${headerBase64}.${payloadBase64}.${signature}`,
    expiresIn: accessTokenTimeSpan
  };
};

export const generateRefreshToken = (refreshTokenId: string): Token => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  const headerBase64 = encodeToBase64(JSON.stringify(header)).replace(/=/g, '');
  const payload = {
    id: refreshTokenId,
    iat: Math.floor(new Date().getTime() / 1000),
    eat: Math.floor(new Date(new Date().getTime() + refreshTokenTimeSpan * 1000).getTime() / 1000)
  };
  const payloadBase64 = encodeToBase64(JSON.stringify(payload)).replace(/=/g, '');
  const signature = hashSHA256(`${headerBase64}.${payloadBase64}`);
  return {
    token: `${headerBase64}.${payloadBase64}.${signature}`,
    expiresIn: refreshTokenTimeSpan
  };
};

export const verifyJWTToken = (token: string): boolean => {
  const [headerBase64, payloadBase64, signature] = token.split('.');
  if (!headerBase64 || !payloadBase64 || !signature) return false;
  if (hashSHA256(`${headerBase64}.${payloadBase64}`) !== signature) return false;
  const payload: { iat: number; eat: number } = JSON.parse(decodeFromBase64(payloadBase64));
  if (Math.floor(new Date().getTime() / 1000) > payload.eat) return false;

  return true;
};

export function getDataFromJWTToken<T>(token: string): T {
  const [, payloadBase64] = token.split('.');

  return JSON.parse(decodeFromBase64(payloadBase64));
}
