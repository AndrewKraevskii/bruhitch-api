import ApiError from '$exceptions/apiError';
import { TwitchError, UserData } from '$types/twitch';
import { StatusCodes } from 'http-status-codes';

const getUserData = async (accessToken: string): Promise<UserData> => {
  const headers = new Headers();

  headers.append('Authorization', `Bearer ${accessToken}`);
  const response: TwitchError | UserData = await fetch('https://id.twitch.tv/oauth2/userinfo', {
    headers: headers
  }).then((r) => r.json());

  if ((response as TwitchError).status) {
    const error = response as TwitchError;
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
  }

  return response as UserData;
};

export default getUserData;
