import getWsClient from './getWsClient';

const addEventSubIdInWsClient = (id: string, eventSubId: string) => {
  const currentWsClient = getWsClient(id);
  if (!currentWsClient) return;
  currentWsClient.eventSubIds.push(eventSubId);
  (global as any).wsClients = [...wsClients.filter((v) => v.id !== id), currentWsClient];
};
export default addEventSubIdInWsClient;
