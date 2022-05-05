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

    switch (type) {
      case TwitchEventSubType.Notification: {
        if (
          !(
            [
              TwitchEventType.PredictionBegin,
              TwitchEventType.PredictionProgress,
              TwitchEventType.PredictionEnd
            ] as string[]
          ).includes(data.subscription.type)
        )
          return res.status(StatusCodes.BAD_REQUEST);

        const retry = req.headers[TwitchHeader.Retry];

        if (retry !== '0') return res.status(StatusCodes.NO_CONTENT);

        switch (data.subscription.type) {
          case TwitchEventType.PredictionBegin: {
            wsClient.ws.send(
              getResponseMessage(CallbackResponseMessageType.SubscribePredictionBegin, data.event)
            );
            break;
          }
          case TwitchEventType.PredictionProgress: {
            wsClient.ws.send(
              getResponseMessage(
                CallbackResponseMessageType.SubscribePredictionProgress,
                data.event
              )
            );
            break;
          }
          case TwitchEventType.PredictionEnd: {
            wsClient.ws.send(
              getResponseMessage(CallbackResponseMessageType.SubscribePredictionEnd, data.event)
            );
            break;
          }
          default: {
            console.log(data.event);
          }
        }

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
