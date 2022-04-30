import { User } from '@prisma/client';
import fetch from 'cross-fetch';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { prisma } from '../lib/db';
import getAccessToken from '../lib/getAccessToken';
import getEnv from '../lib/getEnv';
import unsubscribeFromEvent from '../lib/unsubscribeFromEvent';
import { getErrorMessage, getStatusMessage } from '../lib/ws';
import { Environment } from '../types/env';
import { TwitchEventType } from '../types/twitch';
import { RequestMessageType, WSRequest } from '../types/ws';

export const createWebSocketCallback = (
  webSocketServer: WebSocket.Server<WebSocket.WebSocket>
): ((ws: WebSocket.WebSocket, request: IncomingMessage) => void) => {
  const callback: (ws: WebSocket.WebSocket, request: IncomingMessage) => void = async (
    ws,
    request
  ) => {
    //#region Initial data
    const url = new URL('http://localhost' + request.url);
    const token = url.searchParams.get('token');
    if (!token) {
      return ws.close(3000, JSON.stringify(getErrorMessage('incorrect token')));
    }

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
      if (!user) return ws.close(3000, JSON.stringify(getErrorMessage('invalid token')));
    } catch (e) {
      return ws.close(3000, JSON.stringify(getErrorMessage('invalid token')));
    }

    const client = { id: user.id + new Date().getTime(), ws };

    let subscribedTypes: RequestMessageType[] = [];
    //#endregion

    //#region On message
    ws.on('message', async (m) => {
      const rawData = Buffer.from(m.toString(), 'binary').toString('utf-8');
      let req: WSRequest<any>;
      try {
        req = JSON.parse(rawData);
      } catch (e) {
        return ws.send(JSON.stringify(getErrorMessage('data is not JSON')));
      }

      switch (req.type) {
        case RequestMessageType.SubscribeFollow: {
          if (subscribedTypes.includes(RequestMessageType.SubscribeFollow)) return;

          //#region Subscribe to EventSub
          const clientId = getEnv(Environment.TwitchClientId);
          const secretKey = getEnv(Environment.SecretKey);
          const accessToken = await getAccessToken(clientId, getEnv(Environment.TwitchSecretKey));
          if (!accessToken)
            return ws.send(JSON.stringify(getErrorMessage('problem with get app access token')));
          const callback =
            getEnv(Environment.CallbackOrigin) + '/api/v1/follow/callback?clientId=' + client.id;

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
                  broadcaster_user_id: user.id
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
            data: (await r.json()) as {
              data: {
                id: string;
                status: string;
                type: string;
                version: string;
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
            }
          }));

          if (status !== 202) {
            console.log(data);
            return ws.send(JSON.stringify(getErrorMessage('problem with subscribe')));
          }

          subscribedTypes.push(RequestMessageType.SubscribeFollow);
          (global as any).wsClients[client.id] = { ws: client.ws, subscribeIds: [] };
          //#endregion

          return ws.send(JSON.stringify(getStatusMessage(RequestMessageType.SubscribeFollow)));
        }
        default: {
          return ws.send(JSON.stringify(getErrorMessage('incorrect type')));
        }
      }
    });
    //#endregion

    ws.on('error', (e) => ws.send(JSON.stringify(getErrorMessage(e.message))));

    //#region On close WebSocket
    ws.on('close', async () => {
      (global as any).wsClients[client.id]?.subscribeIds.forEach(async (v: string) => {
        await unsubscribeFromEvent(v);
      });
    });
    //#endregion
  };
  return callback;
};
