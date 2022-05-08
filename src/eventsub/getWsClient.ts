import { WsClient } from '$types/ws';

const getWsClient = (id: string): WsClient | undefined => {
  return wsClients.find((v: WsClient) => v.id === id);
};

export default getWsClient;
