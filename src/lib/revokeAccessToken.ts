import fetch from 'cross-fetch';
import { Environment } from '../types/env';
import { TwitchError } from '../types/twitch';
import getEnv from './getEnv';

const revokeAccessToken = async (accessToken: string): Promise<TwitchError | undefined> => {
  return await fetch('https://id.twitch.tv/oauth2/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `client_id=${getEnv(Environment.TwitchClientId)}&token=${accessToken}`
  })
    .then((r) => {
      if (r.status === 200) return undefined;
      return r.json();
    })
    .catch(console.error);
};

export default revokeAccessToken;
