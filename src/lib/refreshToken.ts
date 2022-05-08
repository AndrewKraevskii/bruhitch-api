import ApiError from '$exceptions/apiError';
import { RefreshToken, TwitchError } from '$types/twitch';
import { StatusCodes } from 'http-status-codes';

const refreshToken = async (refreshToken: string): Promise<RefreshToken> => {
  const response: RefreshToken | TwitchError = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET_KEY}`
  }).then((r) => r.json());

  if ((response as TwitchError).status) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, (response as TwitchError).message);
  }

  return response as RefreshToken;
};

export default refreshToken;
