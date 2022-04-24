import fetch from 'cross-fetch';
import { Environment } from '../types/env';
import { RefreshToken, TwitchError } from '../types/twitch';
import getEnv from './getEnv';

const refreshToken = async (refreshToken: string): Promise<RefreshToken | TwitchError> => {
  return await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${getEnv(
      Environment.TwitchClientId
    )}&client_secret=${getEnv(Environment.TwitchSecretKey)}`
  })
    .then((r) => r.json())
    .catch(console.error);
};

export default refreshToken;
