import getRedirectURI from '$donationalerts/getRedirectURI';
import getToken from '$donationalerts/getToken';
import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import handleErrorAsync from '$lib/handleErrorAsync';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const callback = Router();

callback.get(
  '/',
  handleErrorAsync(async (req, res) => {
    const { code, error } = req.query as { [key: string]: string };

    //#region Validate callback
    if (!code || error) throw new ApiError(StatusCodes.BAD_REQUEST, error || 'Invalid code');
    //#endregion

    if (!req.session.userId) throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid userId');

    //#region Get DonationAlerts tokens
    let redirectUri = getRedirectURI(!!req.headers.host?.includes('localhost'));
    const response = await getToken(code, redirectUri);

    await prisma.donationAlerts.upsert({
      where: {
        userId: req.session.userId
      },
      create: {
        refreshToken: response.refresh_token,
        userId: req.session.userId
      },
      update: {
        refreshToken: response.refresh_token,
        userId: req.session.userId
      }
    });
    //#endregion

    res.status(StatusCodes.PERMANENT_REDIRECT).redirect('/');
  })
);

export default callback;
