import getAppAccessToken from '$lib/getAppAccessToken';
import getHeaders from '$lib/getHeaders';

const unsubscribeFromEvent = async (id: string) => {
  const accessToken = await getAppAccessToken();
  if (!accessToken) return 500;

  const headers = getHeaders(accessToken);

  const r = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions?id=' + id, {
    method: 'DELETE',
    headers
  });
  return r.status;
};

export default unsubscribeFromEvent;
