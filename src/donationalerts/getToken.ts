import ApiError from '$exceptions/apiError';
import { TokenResponse } from '$types/donationAlerts';
import { StatusCodes } from 'http-status-codes';

const getToken = async (code: string, redirectUri: string) => {
  const response: { status: number; data: TokenResponse } = await fetch(
    'https://www.donationalerts.com/oauth/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=authorization_code&client_id=${process.env.DONATIONALERTS_CLIENT_ID}
      &client_secret=${process.env.DONATIONALERTS_SECRET_KEY}&redirect_uri=${redirectUri}&code=${code}`
    }
  ).then(async (r) => ({ status: r.status, data: await r.json() }));

  if (response.status !== 200) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Get DonationAlerts tokens error');
  }
  return response.data;
};

export default getToken;
