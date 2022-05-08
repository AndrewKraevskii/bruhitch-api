import getWsClient from './getWsClient';
import unsubscribeFromEvent from './unsubscribeFromEvent';

const removeWsClient = (id: string) => {
  const wsClient = getWsClient(id);

  wsClient?.eventSubIds.forEach(async (v: string) => {
    try {
      await unsubscribeFromEvent(v);
    } catch (e) {}
  });

  wsClients = wsClients.filter((v) => v.id !== id);
};

export default removeWsClient;
