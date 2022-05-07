const revokeAccessToken = async (accessToken: string): Promise<void> => {
  await fetch('https://id.twitch.tv/oauth2/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `client_id=${process.env.TWITCH_CLIENT_ID}&token=${accessToken}`
  }).catch(console.error);
};

export default revokeAccessToken;
