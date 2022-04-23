import fetch from 'cross-fetch';
import getHeaders from './getHeaders';

const getUserId = async (
  channel: string,
  clientId: string,
  accessToken: string
): Promise<string | undefined> => {
  const headers = getHeaders(clientId, accessToken);

  const broadcaster: {
    data: { id: string }[];
  } = await fetch('https://api.twitch.tv/helix/users?login=' + channel, {
    method: 'GET',
    headers
  }).then((r) => r.json());

  return broadcaster?.data[0]?.id;
};

export default getUserId;
