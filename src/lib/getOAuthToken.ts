import ApiError from '$exceptions/apiError';
import { OAuthToken, TwitchError } from '$types/twitch';
import { StatusCodes } from 'http-status-codes';

const getOAuthToken = async (code: string, redirectUri: string): Promise<OAuthToken> => {
  const url = new URL('https://id.twitch.tv/oauth2/token');

  url.searchParams.append('client_id', process.env.TWITCH_CLIENT_ID);
  url.searchParams.append('client_secret', process.env.TWITCH_SECRET_KEY);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('code', code);
  url.searchParams.append('grant_type', 'authorization_code');

  const response: TwitchError | OAuthToken = await fetch(url.href, { method: 'POST' }).then((r) =>
    r.json()
  );

  if ((response as TwitchError).status) {
    const error = response as TwitchError;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }
  return response as OAuthToken;
};

export default getOAuthToken;
