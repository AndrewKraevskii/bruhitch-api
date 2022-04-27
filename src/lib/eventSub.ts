import { createHmac, timingSafeEqual } from 'crypto';
import { IncomingHttpHeaders } from 'http';
import { TwitchHeader } from '../types/twitch';

export const HMAC_PREFIX = 'sha256=';

export const getHmacMessage = (headers: IncomingHttpHeaders, body: string): string => {
  const id = headers[TwitchHeader.Id] as string;
  const timestamp = headers[TwitchHeader.Timestamp] as string;
  return id + timestamp + body;
};

export const getHmac = (secret: string, message: string): string => {
  return createHmac('sha256', secret).update(message).digest('hex');
};

export const verifyMessage = (hmac: string, verifySignature: string) => {
  return timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
};
