import fetch from 'cross-fetch';
import getAccessToken from '../lib/getAccessToken';
import getEnv from '../lib/getEnv';
import { getEventSubCallback } from '../lib/getEventSubCallback';
import {
  addSubscribeTypeInWsClient,
  getErrorMessage,
  getResponseMessage,
  getWsClient
} from '../lib/ws';
import { Environment } from '../types/env';
import { TwitchEventType } from '../types/twitch';
import { BaseResponseMessageType, RequestMessageType, WSResponseMessageType } from '../types/ws';

export const subscribeFollow = async (id: string) => {
  const wsClient = getWsClient(id);
  if (!wsClient) {
    wsClient.ws.close(3000, getResponseMessage(BaseResponseMessageType.Reconnect, undefined));
    return;
  }
  if (wsClient.subscribeTypes.includes(RequestMessageType.SubscribeFollow)) return;

  //#region Get access token and generate callback url
  const clientId = getEnv(Environment.TwitchClientId);
  const secretKey = getEnv(Environment.SecretKey);
  const accessToken = await getAccessToken(clientId, getEnv(Environment.TwitchSecretKey));
  if (!accessToken)
    return wsClient.ws.send(JSON.stringify(getErrorMessage('problem with get app access token')));
  const callback = getEventSubCallback(wsClient.id, 'follow');
  //#endregion

  //#region Subscribe to EventSub
  const { status, data } = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Client-Id': clientId,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: TwitchEventType.Follow,
      version: '1',
      condition: {
        broadcaster_user_id: wsClient.channelId
      },
      transport: {
        method: 'webhook',
        callback: callback,
        secret: secretKey
      }
    })
  }).then(async (r) => ({
    status: r.status,
    data: await r.json()
  }));

  if (status !== 202) {
    return wsClient.ws.send(getErrorMessage(data?.error ?? 'problem with subscribe'));
  }

  addSubscribeTypeInWsClient(wsClient.id, RequestMessageType.SubscribeFollow);
  //#endregion

  wsClient.ws.send(getResponseMessage(WSResponseMessageType.Subscribed, undefined));
};
