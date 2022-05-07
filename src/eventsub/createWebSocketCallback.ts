import { prisma } from '$lib/db';
import {
  RequestMessageType,
  WsClient,
  WSRequest,
  WSResponseMessageType,
  WsStatusCodes
} from '$types/ws';
import { User } from '@prisma/client';
import { IncomingMessage } from 'http';
import { v4 } from 'uuid';
import WebSocket from 'ws';
import getErrorMessage from './getErrorMessage';
import getResponseMessage from './getResponseMessage';
import removeWsClient from './removeWsClient';
import subscribeFollow from './subscribe/subscribeFollow';
import subscribePrediction from './subscribe/subscribePrediction';

const createWebSocketCallback = (
  webSocketServer: WebSocket.Server<WebSocket.WebSocket>
): ((ws: WebSocket.WebSocket, request: IncomingMessage) => void) => {
  const callback: (ws: WebSocket.WebSocket, request: IncomingMessage) => void = async (
    ws,
    request
  ) => {
    //#region Connect

    //#region Check for twitch token
    const url = new URL('http://localhost' + request.url);
    const token = url.searchParams.get('token');
    if (!token) {
      return ws.close(WsStatusCodes.Forbidden, getErrorMessage('Incorrect token'));
    }
    //#endregion

    //#region Get user by twitch token
    let twitchToken: {
      User: User;
    } | null;
    try {
      twitchToken = await prisma.twitchToken.findUnique({
        where: {
          id: token
        },
        select: {
          User: true
        }
      });
    } catch (e) {
      return ws.close(WsStatusCodes.InternalError, getErrorMessage('Error on get twitch token'));
    }
    if (!twitchToken) {
      return ws.close(WsStatusCodes.Forbidden, getErrorMessage('Invalid token'));
    }
    //#endregion

    //#region Initialize WsClient and push into WsClients
    const WS_CLIENT_ID = v4();

    const WS_CLIENT: WsClient = {
      id: WS_CLIENT_ID,
      channel: twitchToken.User.username,
      channelId: twitchToken.User.id,
      ws: ws,
      subscribeTypes: [],
      eventSubIds: []
    };
    wsClients.push(WS_CLIENT);
    //#endregion

    //#endregion

    //#region Message
    ws.on('message', async (raw) => {
      //#region Convert buffer to string
      const rawData = Buffer.from(raw.toString(), 'binary').toString('utf-8');
      //#endregion

      //#region Convert string to json data
      let request: WSRequest<any>;
      try {
        request = JSON.parse(rawData);
      } catch (e) {
        return ws.send(getErrorMessage('Data is not JSON'));
      }
      //#endregion

      //#region Check type of request
      switch (request.type) {
        case RequestMessageType.SubscribeFollow: {
          return subscribeFollow(WS_CLIENT_ID, ws);
        }
        case RequestMessageType.SubscribePrediction: {
          return subscribePrediction(WS_CLIENT_ID, ws);
        }
        case RequestMessageType.Ping: {
          return ws.send(getResponseMessage(WSResponseMessageType.Pong, undefined));
        }
        default: {
          return ws.send(getErrorMessage('incorrect type'));
        }
      }
      //#endregion
    });
    //#endregion

    //#region Error
    ws.on('error', (e) => ws.send(getErrorMessage(e.message)));
    //#endregion

    //#region Close
    ws.on('close', async () => {
      removeWsClient(WS_CLIENT_ID);
    });
    //#endregion
  };
  return callback;
};

export default createWebSocketCallback;
