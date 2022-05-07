import { RequestMessageType } from '$types/ws';
import getWsClient from './getWsClient';

const addSubscribeTypeInWsClient = (id: string, type: RequestMessageType) => {
  const currentWsClient = getWsClient(id);
  if (!currentWsClient) return;
  currentWsClient.subscribeTypes.push(type);
  wsClients = [...wsClients.filter((v) => v.id !== id), currentWsClient];
};

export default addSubscribeTypeInWsClient;
