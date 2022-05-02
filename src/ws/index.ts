import { User } from '@prisma/client';
import fetch from 'cross-fetch';
import { IncomingMessage } from 'http';
import { v4 } from 'uuid';
import WebSocket from 'ws';
import { prisma } from '../lib/db';
import getAccessToken from '../lib/getAccessToken';
import getEnv from '../lib/getEnv';
import {
  addSubscribeTypeInWsClient,
  getErrorMessage,
  getResponseMessage,
  getWsClient,
  removeWsClient
} from '../lib/ws';
import { Environment } from '../types/env';
import { TwitchEventType } from '../types/twitch';
import {
  BaseResponseMessageType,
  RequestMessageType,
  WsClient,
  WSRequest,
  WSResponseMessageType
} from '../types/ws';

export const createWebSocketCallback = (
  webSocketServer: WebSocket.Server<WebSocket.WebSocket>
): ((ws: WebSocket.WebSocket, request: IncomingMessage) => void) => {
  const callback: (ws: WebSocket.WebSocket, request: IncomingMessage) => void = async (
    ws,
    request
  ) => {
    //#region Get User and add to wsClients
    const url = new URL('http://localhost' + request.url);
    const token = url.searchParams.get('token');
    if (!token) {
      return ws.close(3000, getErrorMessage('incorrect token'));
    }

    //#region Get user
    let user: User;
    try {
      user = (
        await prisma.twitchToken.findUnique({
          where: {
            id: token
          },
          select: {
            User: true
          }
        })
      ).User;
      if (!user) return ws.close(3000, getErrorMessage('invalid token'));
    } catch (e) {
      return ws.close(3000, getErrorMessage('invalid token'));
    }
    //#endregion

    const WS_CLIENT_ID = v4();

    const WS_CLIENT: WsClient = {
      id: WS_CLIENT_ID,
      channel: user.username,
      channelId: user.id,
      ws: ws,
      subscribeTypes: [],
      eventSubIds: []
    };
    (global as any).wsClients.push(WS_CLIENT);
    //#endregion

    //#region On message
    ws.on('message', async (m) => {
      //#region Parse string to JSON
      const rawData = Buffer.from(m.toString(), 'binary').toString('utf-8');
      let req: WSRequest<any>;
      try {
        req = JSON.parse(rawData);
      } catch (e) {
        return ws.send(getErrorMessage('data is not JSON'));
      }
      //#endregion

      switch (req.type) {
        //#region Subscribe Follow
        case RequestMessageType.SubscribeFollow: {
          const wsClient = getWsClient(WS_CLIENT_ID);
          if (!wsClient) {
            ws.close(3000, getResponseMessage(BaseResponseMessageType.Reconnect, undefined));
            return;
          }
          if (wsClient.subscribeTypes.includes(RequestMessageType.SubscribeFollow)) return;

          //#region Subscribe to EventSub

          //#region Get access token and generate callback url
          const clientId = getEnv(Environment.TwitchClientId);
          const secretKey = getEnv(Environment.SecretKey);
          const accessToken = await getAccessToken(clientId, getEnv(Environment.TwitchSecretKey));
          if (!accessToken)
            return ws.send(JSON.stringify(getErrorMessage('problem with get app access token')));
          const callback =
            getEnv(Environment.CallbackOrigin) + '/api/v1/follow/callback?clientId=' + wsClient.id;
          //#endregion

          const { status, data } = await fetch(
            'https://api.twitch.tv/helix/eventsub/subscriptions',
            {
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
            }
          ).then(async (r) => ({
            status: r.status,
            data: await r.json()
          }));

          if (status !== 202) {
            return ws.send(getErrorMessage(data?.error ?? 'problem with subscribe'));
          }

          addSubscribeTypeInWsClient(WS_CLIENT_ID, RequestMessageType.SubscribeFollow);
          //#endregion

          return ws.send(getResponseMessage(WSResponseMessageType.Subscribed, undefined));
        }
        //#endregion
        default: {
          return ws.send(getErrorMessage('incorrect type'));
        }
      }
    });
    //#endregion

    ws.on('error', (e) => ws.send(getErrorMessage(e.message)));

    //#region On close WebSocket
    ws.on('close', async () => {
      removeWsClient(WS_CLIENT_ID);
    });
    //#endregion
  };
  return callback;
};
