import refreshToken from '$donationalerts/refreshToken';
import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import handleErrorAsync from '$lib/handleErrorAsync';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const token = Router();

token.get(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for twitch token
    const { token } = req.query as { [key: string]: string | undefined };
    if (!token) throw new ApiError(StatusCodes.FORBIDDEN, 'Incorrect token');
    //#endregion

    //#region Get follow settings by twitch token
    const twitchToken = await prisma.twitchToken.findUnique({
      where: {
        id: token
      },
      select: {
        User: {
          select: {
            DonationAlerts: true
          }
        }
      }
    });
    if (!twitchToken) throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid token');
    const donationAlerts = twitchToken.User.DonationAlerts;
    //#endregion

    if (!donationAlerts) return res.status(StatusCodes.OK).json({ accessToken: null });

    //#region Refresh DonationAlerts token
    const response = await refreshToken(donationAlerts.refreshToken);

    await prisma.donationAlerts.update({
      where: {
        id: donationAlerts.id
      },
      data: {
        refreshToken: response.refresh_token
      }
    });
    //#endregion

    res.status(StatusCodes.OK).json({ accessToken: response.access_token });
  })
);

export default token;
