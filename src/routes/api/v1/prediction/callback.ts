import addEventSubIdInWsClient from '$eventsub/addEventSubIdInWsClient';
import getHmac from '$eventsub/getHmac';
import getHmacMessage from '$eventsub/getHmacMessage';
import getResponseMessage from '$eventsub/getResponseMessage';
import getWsClient from '$eventsub/getWsClient';
import HMAC_PREFIX from '$eventsub/hmacPrefix';
import notificationMaxLifeTime from '$eventsub/notificationMaxLifeTime';
import verifyMessage from '$eventsub/verifyMessage';
import ApiError from '$exceptions/apiError';
import handleErrorAsync from '$lib/handleErrorAsync';
import { hashSHA256 } from '$lib/sha256';
import {
  EventSubCallbackType,
  EventSubHeader,
  EventSubResponse,
  EventSubType
} from '$types/eventsub';
import { BaseResponseMessageType, CallbackResponseMessageType } from '$types/ws';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const callback = Router();

callback.post(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for clientId
    const { clientId } = req.query as { [key: string]: string | undefined };
    if (!clientId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Incorrect clientId');
    }
    //#endregion

    //#region Verify message
    const secret = hashSHA256(process.env.TWITCH_SECRET_KEY);
    const rawJson = JSON.stringify(req.body);
    const message = getHmacMessage(req.headers, rawJson);
    const hmac = HMAC_PREFIX + getHmac(secret, message);

    const sign = req.headers[EventSubHeader.Signature] as string;
    if (!verifyMessage(hmac, sign)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Failed verification');
    }
    //#endregion

    //#region Validate clientId

    const wsClient = getWsClient(clientId);

    if (!wsClient) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid clientId');
    }
    //#endregion

    //#region Check for type of subscription
    const data: EventSubResponse = JSON.parse(rawJson);

    const allowedTypes = [
      EventSubType.PredictionBegin,
      EventSubType.PredictionProgress,
      EventSubType.PredictionEnd
    ] as string[];

    if (!allowedTypes.includes(data.subscription.type))
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Incorrect subscription type');
    //#endregion

    //#region Check for type of message

    const type = req.headers[EventSubHeader.Type];

    switch (type) {
      case EventSubCallbackType.Notification: {
        //#region  Add EventSub Id if does not already exist
        if (!wsClient.eventSubIds.includes(data.subscription.id)) {
          addEventSubIdInWsClient(clientId, data.subscription.id);
        }
        //#endregion

        //#region Check notification life time
        const timestamp = new Date(req.headers[EventSubHeader.Timestamp] as string);

        if (new Date(timestamp.getTime() * notificationMaxLifeTime) < new Date()) {
          return res.status(StatusCodes.NO_CONTENT);
        }
        //#endregion

        switch (data.subscription.type) {
          case EventSubType.PredictionBegin: {
            wsClient.ws.send(
              getResponseMessage(CallbackResponseMessageType.SubscribePredictionBegin, data.event)
            );
            break;
          }
          case EventSubType.PredictionProgress: {
            wsClient.ws.send(
              getResponseMessage(
                CallbackResponseMessageType.SubscribePredictionProgress,
                data.event
              )
            );
            break;
          }
          case EventSubType.PredictionEnd: {
            wsClient.ws.send(
              getResponseMessage(CallbackResponseMessageType.SubscribePredictionEnd, data.event)
            );
            break;
          }
        }

        return res.status(StatusCodes.NO_CONTENT);
      }
      case EventSubCallbackType.Verification: {
        //#region  Add EventSub Id if does not already exist
        if (!wsClient.eventSubIds.includes(data.subscription.id)) {
          addEventSubIdInWsClient(clientId, data.subscription.id);
        }
        //#endregion

        //#region Send Verification CallbackResponseMessageType.VerificationPrediction(Begin|Progress|End)
        switch (data.subscription.type) {
          case EventSubType.PredictionBegin: {
            wsClient.ws.send(
              getResponseMessage(CallbackResponseMessageType.VerificationPredictionBegin, undefined)
            );
            break;
          }
          case EventSubType.PredictionProgress: {
            wsClient.ws.send(
              getResponseMessage(
                CallbackResponseMessageType.VerificationPredictionProgress,
                undefined
              )
            );
            break;
          }
          case EventSubType.PredictionEnd: {
            wsClient.ws.send(
              getResponseMessage(CallbackResponseMessageType.VerificationPredictionEnd, undefined)
            );
            break;
          }
        }
        //#endregion

        res.writeHead(StatusCodes.OK, { 'Content-Type': 'text/plain' });
        res.write(data.challenge);
        res.end();
        return;
      }
      case EventSubCallbackType.Revocation: {
        //#region Send Reconnect to WsClient
        wsClient.ws.send(getResponseMessage(BaseResponseMessageType.Reconnect, undefined));
        //#endregion
        return res.status(StatusCodes.NO_CONTENT);
      }
      default: {
        console.log(`Unknown message type: ${type}`);
        return res.status(StatusCodes.NOT_FOUND);
      }
    }
    //#endregion
  })
);

export default callback;
