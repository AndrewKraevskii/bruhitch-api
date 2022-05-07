const getHeaders = (accessToken: string): Headers => {
  const headers = new Headers();

  headers.append('Authorization', `Bearer ${accessToken}`);
  headers.append('Client-Id', process.env.TWITCH_CLIENT_ID);

  return headers;
};

export default getHeaders;
