import { BaseResponseMessageType } from '$types/ws';

const getErrorMessage = (message: string): string => {
  return JSON.stringify({
    type: BaseResponseMessageType.Error,
    message
  });
};

export default getErrorMessage;
