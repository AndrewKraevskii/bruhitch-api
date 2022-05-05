import { Environment } from '../types/env';
import getEnv from './getEnv';

export const getEventSubCallback = (id: string | number, endpoint: 'follow' | 'prediction') => {
  return `${getEnv(Environment.CallbackOrigin)}/api/v1/${endpoint}/callback?clientId=${id}`;
};

export const eventSubRegex = /https:\/\/([^\/]*)\/api\/v1\/([^\/]*)\/callback\?clientId=([^&]*)/i;
