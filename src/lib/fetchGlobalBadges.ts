import getHeaders from '$lib/getHeaders';
import { TwitchBadge } from '$types/badge';

const fetchGlobalBadges = async (accessToken: string): Promise<TwitchBadge[]> => {
  const headers = getHeaders(accessToken);

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
