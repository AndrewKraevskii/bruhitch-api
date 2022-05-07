import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getErrorMessage } from '../../../../lib/error';
import { getHmac, getHmacMessage, HMAC_PREFIX, verifyMessage } from '../../../../lib/eventSub';
import getEnv from '../../../../lib/getEnv';
import { addEventSubIdInWsClient, getResponseMessage, getWsClient } from '../../../../lib/ws';
import { Environment } from '../../../../types/env';
import {
  TwitchEventSubResponse,
  TwitchEventSubType,
  TwitchEventType,
  TwitchHeader
} from '../../../../types/twitch';
import { CallbackResponseMessageType } from '../../../../types/ws';

const callback = Router();

const tenMinutes = 1000 * 60 * 10;

callback.post('/', async (req, res) => {
  const { clientId } = req.query as { clientId: string };

  if (!clientId)
    return res.status(StatusCodes.BAD_REQUEST).json(getErrorMessage('undefined clientId'));

  let secret = getEnv(Environment.SecretKey);
  const rawJson = JSON.stringify(req.body);
  let message = getHmacMessage(req.headers, rawJson);
  let hmac = HMAC_PREFIX + getHmac(secret, message);

  const sign = req.headers[TwitchHeader.Signature] as string;

  if (verifyMessage(hmac, sign)) {
    const type = req.headers[TwitchHeader.Type];
    const data: TwitchEventSubResponse = JSON.parse(rawJson);

    const wsClient = getWsClient(clientId);
    if (!wsClient) return res.status(StatusCodes.INTERNAL_SERVER_ERROR);

    if (!wsClient.eventSubIds.includes(data.subscription.id)) {
      addEventSubIdInWsClient(clientId, data.subscription.id);
    }

    console.log('Follow', data.event)
    switch (type) {
      case TwitchEventSubType.Notification: {
        if (data.subscription.type !== TwitchEventType.Follow)
          return res.status(StatusCodes.BAD_REQUEST);

        const timestamp = new Date(req.headers[TwitchHeader.Timestamp] as string);

        if (new Date(timestamp.getTime() * tenMinutes) < new Date()) {
          return res.status(StatusCodes.NO_CONTENT);
        }

        wsClient.ws.send(
          getResponseMessage(CallbackResponseMessageType.SubscribeFollow, data.event)
        );

        return res.status(StatusCodes.NO_CONTENT);
      }
      case TwitchEventSubType.Verification: {
        res.writeHead(StatusCodes.OK, { 'Content-Type': 'text/plain' });
        res.write(data.challenge);
        res.end();
        wsClient.ws.send(JSON.stringify({ type: 'verification/' + data.subscription.type }));
        return;
      }
      case TwitchEventSubType.Revocation: {
        return res.status(StatusCodes.NO_CONTENT);
      }
      default: {
        console.log(`Unknown message type: ${type}`);
        return res.status(StatusCodes.NO_CONTENT);
      }
    }
  }

  res.status(StatusCodes.FORBIDDEN);
});

export default callback;
