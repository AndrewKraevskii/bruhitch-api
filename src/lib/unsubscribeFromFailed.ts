import fetch from 'cross-fetch';
import { Environment } from '../types/env';
import { TwitchEventType } from '../types/twitch';
import getAccessToken from './getAccessToken';
import getEnv from './getEnv';
import { eventSubRegex } from './getEventSubCallback';
import unsubscribeFromEvent from './unsubscribeFromEvent';
import { getWsClientIds } from './ws';

export const unsubscribeFromFailed = async () => {
  const clientId = getEnv(Environment.TwitchClientId);
  const accessToken = await getAccessToken(clientId, getEnv(Environment.TwitchSecretKey));
  if (!accessToken) {
    return console.log('[ERR] Get access token error on unsubscribeFromFailed');
  }

  const res: {
    data: {
      id: string;
      status:
        | 'enabled'
        | 'webhook_callback_verification_failed'
        | 'webhook_callback_verification_pending';
      type: TwitchEventType;
      version: '1';
      cost: number;
      condition: {
        broadcaster_user_id: string;
      };
      created_at: string;
      transport: {
        method: string;
        callback: string;
      };
    }[];
    total: number;
    total_cost: number;
    max_total_cost: number;
    pagination: {};
  } = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Client-Id': clientId
    }
  })
    .then((r) => r.json())
    .catch(console.error);

  let idsToUnsubscribe: string[] = [];

  let wsClientIds = getWsClientIds();
  res.data.forEach((v) => {
    if (v.status === 'webhook_callback_verification_failed') {
      return idsToUnsubscribe.push(v.id);
    }
    const [, origin, endpoint, clientId] = eventSubRegex.exec(v.transport.callback);
    if (getEnv(Environment.CallbackOrigin) !== origin) {
      return idsToUnsubscribe.push(v.id);
    }
    if (!['follow', 'prediction'].includes(endpoint)) {
      return idsToUnsubscribe.push(v.id);
    }
    if (!wsClientIds.includes(clientId)) {
      return idsToUnsubscribe.push(v.id);
    }
  });

  idsToUnsubscribe.forEach(async (v) => {
    await unsubscribeFromEvent(v);
  });
};
