import { createHmac } from 'crypto';

const getHmac = (secret: string, message: string): string => {
  return createHmac('sha256', secret).update(message).digest('hex');
};

export default getHmac;
