import addSubscribeTypeInWsClient from '$eventsub/addSubscribeTypeInWsClient';
import getErrorMessage from '$eventsub/getErrorMessage';
import getEventSubCallback from '$eventsub/getEventSubCallback';
import getResponseMessage from '$eventsub/getResponseMessage';
import getWsClient from '$eventsub/getWsClient';
import getAppAccessToken from '$lib/getAppAccessToken';
import { hashSHA256 } from '$lib/sha256';
import { EventSubType } from '$types/eventsub';
import {
  BaseResponseMessageType,
  RequestMessageType,
  WSResponseMessageType,
  WsStatusCodes
} from '$types/ws';
import { WebSocket } from 'ws';

const subscribeFollow = async (id: string, ws: WebSocket) => {
  //#region Get WsClient
  const wsClient = getWsClient(id);
  if (!wsClient) {
    ws.close(
      WsStatusCodes.Forbidden,
      getResponseMessage(BaseResponseMessageType.Reconnect, undefined)
    );
    return;
  }
  //#endregion

  //#region Check subscribe types against an existing type
  if (wsClient.subscribeTypes.includes(RequestMessageType.SubscribeFollow)) return;
  //#endregion

  //#region Get App access token
  const accessToken = await getAppAccessToken();
  if (!accessToken) return ws.send(getErrorMessage('Error on get app access token'));
  //#endregion

  //#region Subscribe on EventSub channel.follow
  const callback = getEventSubCallback(wsClient.id, 'follow');

  const { status, data } = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Client-Id': process.env.TWITCH_CLIENT_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: EventSubType.Follow,
      version: '1',
      condition: {
        broadcaster_user_id: wsClient.channelId
      },
      transport: {
        method: 'webhook',
        callback: callback,
        secret: hashSHA256(process.env.TWITCH_SECRET_KEY)
      }
    })
  }).then(async (r) => ({
    status: r.status,
    data: await r.json()
  }));

  if (status !== 202) {
    return wsClient.ws.send(getErrorMessage(data?.error ?? 'Error on subscribe on channel.follow'));
  }
  //#endregion

  //#region Add subscribe type to subscribe types
  addSubscribeTypeInWsClient(wsClient.id, RequestMessageType.SubscribeFollow);
  //#endregion

  ws.send(getResponseMessage(WSResponseMessageType.Subscribed, undefined));
};

export default subscribeFollow;
