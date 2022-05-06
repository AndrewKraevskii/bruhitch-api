import {
  BaseResponseMessageType,
  RequestMessageType,
  ResponseMessageType,
  WsClient
} from '../types/ws';
import unsubscribeFromEvent from './unsubscribeFromEvent';

export function getResponseMessage<T>(
  type: Exclude<ResponseMessageType, BaseResponseMessageType.Error>,
  data: T
): string {
  return JSON.stringify({
    type,
    data
  });
}

export const getErrorMessage = (message: string): string => {
  return JSON.stringify({
    type: BaseResponseMessageType.Error,
    message
  });
};

export const getWsClient = (id: string): WsClient | undefined => {
  return (global as any).wsClients.find((v: WsClient) => v.id === id);
};

export const getWsClientIds = (): string[] => {
  return (global as any).wsClients.map((v: WsClient) => v.id);
};

export const addSubscribeTypeInWsClient = (id: string, type: RequestMessageType) => {
  const currentWsClient = getWsClient(id);
  if (!currentWsClient) return;
  currentWsClient.subscribeTypes.push(type);
  (global as any).wsClients = [
    ...(global as any).wsClients.filter((v: WsClient) => v.id !== id),
    currentWsClient
  ];
};

export const addEventSubIdInWsClient = (id: string, eventSubId: string) => {
  const currentWsClient = getWsClient(id);
  if (!currentWsClient) return;
  currentWsClient.eventSubIds.push(eventSubId);
  (global as any).wsClients = [
    ...(global as any).wsClients.filter((v: WsClient) => v.id !== id),
    currentWsClient
  ];
};

export const removeWsClient = (id: string) => {
  const wsClient = getWsClient(id);

  wsClient?.eventSubIds.forEach(async (v: string) => {
    await unsubscribeFromEvent(v);
  });

  (global as any).wsClients = (global as any).wsClients.filter((v: WsClient) => v.id !== id);
};
