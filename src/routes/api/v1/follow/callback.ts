import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getErrorMessage } from '../../../../lib/error';
import { getHmac, getHmacMessage, HMAC_PREFIX, verifyMessage } from '../../../../lib/eventSub';
import getEnv from '../../../../lib/getEnv';
import { Environment } from '../../../../types/env';
import {
  TwitchEventSubResponse,
  TwitchEventSubType,
  TwitchEventType,
  TwitchHeader
} from '../../../../types/twitch';

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
          return res.status(StatusCodes.NO_CONTENT);

        const retry = req.headers[TwitchHeader.Retry];

        if (retry !== '0') return res.status(StatusCodes.NO_CONTENT);

        ws.send(JSON.stringify({ type: data.subscription.type, data: data.event }));

        return res.status(StatusCodes.NO_CONTENT);
      }
      case TwitchEventSubType.Verification: {
        res.writeHead(StatusCodes.OK, { 'Content-Type': 'text/plain' });
        res.write(data.challenge);
        res.end();
        return;
      }
      case TwitchEventSubType.Revocation: {
        console.log(`${data.subscription.type} notifications revoked!`);
        console.log(`reason: ${data.subscription.status}`);
        console.log(`condition: ${JSON.stringify(data.subscription.condition, null, 4)}`);
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
