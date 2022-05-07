const getAppAccessToken = async (): Promise<string | undefined> => {
  const data: { access_token: string } = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET_KEY}&grant_type=client_credentials`,
    {
      method: 'POST'
    }
  )
    .then((r) => r.json())
    .catch(console.error);
  return data?.access_token || undefined;
};

export default getAppAccessToken;
