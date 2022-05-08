import { timingSafeEqual } from 'crypto';

const verifyMessage = (hmac: string, verifySignature: string) => {
  return timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
};

export default verifyMessage;
