import { TwitchBadge } from '$types/badge';
import getHeaders from './getHeaders';

const fetchChannelBadges = async (
  broadcasterId: string | number,
  accessToken: string
): Promise<TwitchBadge[]> => {
  const headers = getHeaders(accessToken);

  const chatBadges: { data: TwitchBadge[] } = await fetch(
    'https://api.twitch.tv/helix/chat/badges?broadcaster_id=' + broadcasterId,
    {
      method: 'GET',
      headers
    }
  )
    .then((res) => res.json())
    .catch(console.error);
  return chatBadges?.data ?? [];
};

export default fetchChannelBadges;
