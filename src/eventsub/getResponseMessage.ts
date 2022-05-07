import { BaseResponseMessageType, ResponseMessageType } from '$types/ws';

function getResponseMessage<T>(
  type: Exclude<ResponseMessageType, BaseResponseMessageType.Error>,
  data: T
): string {
  return JSON.stringify({
    type,
    data
  });
}

export default getResponseMessage;
