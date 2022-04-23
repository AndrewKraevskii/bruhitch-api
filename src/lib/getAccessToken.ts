import fetch from 'cross-fetch';

const getAccessToken = async (clientId: string, secretKey: string): Promise<string | undefined> => {
  const data: { access_token: string } = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${secretKey}&grant_type=client_credentials`,
    {
      method: 'POST'
    }
  )
    .then((r) => r.json())
    .catch(console.error);
  return data?.access_token || undefined;
};

export default getAccessToken;
