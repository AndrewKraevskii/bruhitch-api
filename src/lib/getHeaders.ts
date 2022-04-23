import { Headers } from 'cross-fetch';

const getHeaders = (clientId: string, accessToken: string): Headers => {
  const headers = new Headers();

  headers.append('Authorization', `Bearer ${accessToken}`);
  headers.append('Client-Id', clientId.toString());

  return headers;
};

export default getHeaders;
