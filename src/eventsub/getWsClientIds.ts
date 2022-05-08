const getWsClientIds = (): string[] => {
  return wsClients.map((v) => v.id);
};

export default getWsClientIds;
