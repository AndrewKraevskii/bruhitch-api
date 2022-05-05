import WebSocket from 'ws';

export enum RequestMessageType {
  SubscribeFollow = 'subscribe/follow',
  SubscribePrediction = 'subscribe/prediction',
  Ping = 'PING'
}

export type WSRequest<T> = {
  type: RequestMessageType;
  data?: T;
};

export enum BaseResponseMessageType {
  Error = 'error',
  Reconnect = 'reconnect'
}

export enum WSResponseMessageType {
  Subscribed = 'subscribed',
  Pong = 'PONG'
}

export enum CallbackResponseMessageType {
  SubscribeFollow = 'subscribe/follow',
  SubscribePredictionBegin = 'subscribe/prediction/begin',
  SubscribePredictionProgress = 'subscribe/prediction/progress',
  SubscribePredictionEnd = 'subscribe/prediction/end'
}

export type ResponseMessageType =
  | BaseResponseMessageType
  | WSResponseMessageType
  | CallbackResponseMessageType;

export type WSResponse<T> = {
  type: ResponseMessageType;
  message?: string; // On Error and Status ResponseMessageTypes
  data?: T;
};

export type WsClient = {
  id: string;
  channel: string;
  channelId: string;
  ws: WebSocket.WebSocket;
  subscribeTypes: RequestMessageType[];
  eventSubIds: string[];
};
