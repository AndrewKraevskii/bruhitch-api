const getEventSubCallback = (id: string | number, endpoint: 'follow' | 'prediction') => {
  return `${process.env.CALLBACK_ORIGIN}/api/v1/${endpoint}/callback?clientId=${id}`;
};

export default getEventSubCallback;
