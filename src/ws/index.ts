import { User } from '@prisma/client';
import { IncomingMessage } from 'http';
import { v4 } from 'uuid';
import WebSocket from 'ws';
import { prisma } from '../lib/db';
import { getErrorMessage, removeWsClient } from '../lib/ws';
import { RequestMessageType, WsClient, WSRequest } from '../types/ws';
import { subscribeFollow } from './subscribeFollow';

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
          return subscribeFollow(WS_CLIENT_ID);
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
