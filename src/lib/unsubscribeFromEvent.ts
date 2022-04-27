import fetch from 'cross-fetch';
import { Environment } from '../types/env';
import getAccessToken from './getAccessToken';
import getEnv from './getEnv';

const unsubscribeFromEvent = async (id: string) => {
  const clientId = getEnv(Environment.TwitchClientId);
  const accessToken = await getAccessToken(clientId, getEnv(Environment.TwitchSecretKey));
  if (!accessToken) return 500;

  const r = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions?id=' + id, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Client-Id': clientId
    }
  });
  return r.status;
};

export default unsubscribeFromEvent;
