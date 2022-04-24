import fetch, { Headers } from 'cross-fetch';
import { TwitchError, UserData } from '../types/twitch';

const getUserData = async (accessToken: string): Promise<UserData | TwitchError> => {
  const headers = new Headers();

  headers.append('Authorization', `Bearer ${accessToken}`);

  return await fetch('https://id.twitch.tv/oauth2/userinfo', {
    headers: headers
  })
    .then((r) => r.json())
    .catch(console.error);
};

export default getUserData;
