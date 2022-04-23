import fetch from 'cross-fetch';
import { TwitchBadge } from '../types/badge';
import getHeaders from './getHeaders';

const fetchGlobalBadges = async (clientId: string, accessToken: string): Promise<TwitchBadge[]> => {
  const headers = getHeaders(clientId, accessToken);

  const globalBadges: { data: TwitchBadge[] } = await fetch(
    'https://api.twitch.tv/helix/chat/badges/global',
    {
      method: 'GET',
      headers
    }
  )
    .then((res) => res.json())
    .catch(console.error);
  return globalBadges?.data ?? [];
};

export default fetchGlobalBadges;
