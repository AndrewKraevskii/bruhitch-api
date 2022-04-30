import { BaseResponseMessageType, ResponseMessageType, WSResponse } from '../types/ws';

export function getResponseMessage<T>(
  type: Exclude<
    Exclude<ResponseMessageType, BaseResponseMessageType.Error>,
    BaseResponseMessageType.Status
  >,
  data: T
): WSResponse<T> {
  return {
    type,
    data
  };
}

export const getStatusMessage = (message: string): WSResponse<undefined> => {
  return {
    type: BaseResponseMessageType.Status,
    message
  };
};

export const getErrorMessage = (message: string): WSResponse<undefined> => {
  return {
    type: BaseResponseMessageType.Error,
    message
  };
};
