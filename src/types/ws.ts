export enum RequestMessageType {
  SubscribeFollow = 'subscribe/follow'
}

export type WSRequest<T> = {
  type: RequestMessageType;
  data?: T;
};

export enum BaseResponseMessageType {
  Error = 'error',
  Status = 'status'
}

export enum WSResponseMessageType {
  Subscribed = 'subscribed'
}

export enum CallbackResponseMessageType {
  SubscribeFollow = 'subscribe/follow'
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
