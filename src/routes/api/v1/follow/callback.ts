import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getErrorMessage } from '../../../../lib/error';
import { getHmac, getHmacMessage, HMAC_PREFIX, verifyMessage } from '../../../../lib/eventSub';
import getEnv from '../../../../lib/getEnv';
import { getResponseMessage } from '../../../../lib/ws';
import { Environment } from '../../../../types/env';
import {
  TwitchEventSubResponse,
  TwitchEventSubType,
  TwitchEventType,
  TwitchHeader
} from '../../../../types/twitch';
import { CallbackResponseMessageType } from '../../../../types/ws';

const callback = Router();

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

    const client = (global as any).wsClients[clientId];
    if (!client) return res.status(StatusCodes.INTERNAL_SERVER_ERROR);

    const ws = (global as any).wsClients[clientId].ws;

    if (!(global as any).wsClients[clientId].subscribeIds.includes(data.subscription.id)) {
      (global as any).wsClients[clientId].subscribeIds = [
        ...(global as any).wsClients[clientId].subscribeIds,
        data.subscription.id
      ];
    }

    switch (type) {
      case TwitchEventSubType.Notification: {
        if (data.subscription.type !== TwitchEventType.Follow)
          return res.status(StatusCodes.BAD_REQUEST);

        const retry = req.headers[TwitchHeader.Retry];

        if (retry !== '0') return res.status(StatusCodes.NO_CONTENT);

        const wsRes = getResponseMessage(CallbackResponseMessageType.SubscribeFollow, data.event);

        ws.send(JSON.stringify(wsRes));

        return res.status(StatusCodes.NO_CONTENT);
      }
      case TwitchEventSubType.Verification: {
        res.writeHead(StatusCodes.OK, { 'Content-Type': 'text/plain' });
        res.write(data.challenge);
        res.end();
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
