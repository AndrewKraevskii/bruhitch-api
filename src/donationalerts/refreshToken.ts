import ApiError from '$exceptions/apiError';
import { TokenResponse } from '$types/donationAlerts';
import { StatusCodes } from 'http-status-codes';
import getScopes from './getScopes';

const refreshToken = async (refreshToken: string) => {
  const response: { status: number; data: TokenResponse } = await fetch(
    'https://www.donationalerts.com/oauth/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=refresh_token&client_id=${process.env.DONATIONALERTS_CLIENT_ID}
      &client_secret=${
        process.env.DONATIONALERTS_SECRET_KEY
      }&refresh_token=${refreshToken}&scope=${getScopes().join(' ')}`
    }
  ).then(async (r) => ({ status: r.status, data: await r.json() }));

  if (response.status !== 200) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Refresh token error');
  }
  return response.data;
};

export default refreshToken;
