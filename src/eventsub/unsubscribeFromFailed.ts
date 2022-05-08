import getAppAccessToken from '$lib/getAppAccessToken';
import { EventSubType } from '$types/eventsub';
import eventSubRegex from './eventSubRegex';
import getWsClientIds from './getWsClientIds';
import unsubscribeFromEvent from './unsubscribeFromEvent';

const unsubscribeFromFailed = async (isForce: boolean = false) => {
  const accessToken = await getAppAccessToken();
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
      type: EventSubType;
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
      'Client-Id': process.env.TWITCH_CLIENT_ID
    }
  })
    .then((r) => r.json())
    .catch(console.error);

  let idsToUnsubscribe: string[] = [];

  let wsClientIds = getWsClientIds();
  res.data.forEach((v) => {
    if (isForce) return idsToUnsubscribe.push(v.id);
    if (v.status === 'webhook_callback_verification_failed') {
      return idsToUnsubscribe.push(v.id);
    }
    const regexResult = eventSubRegex.exec(v.transport.callback);
    if (regexResult === null) return;
    const [, origin, endpoint, clientId] = regexResult;
    if (process.env.CALLBACK_ORIGIN !== origin) {
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

export default unsubscribeFromFailed;
