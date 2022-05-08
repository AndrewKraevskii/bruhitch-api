import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import getDefaultScopes from '$lib/getDefaultScopes';
import handleErrorAsync from '$lib/handleErrorAsync';
import refreshToken from '$lib/refreshToken';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const twitch = Router();

twitch.get(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for twitch token
    const { token } = req.query as { [key: string]: string | undefined };
    if (!token) throw new ApiError(StatusCodes.FORBIDDEN, 'Incorrect token');
    //#endregion

    //#region Get user by twitch token and select Twitch refresh token
    const twitchToken = await prisma.twitchToken.findUnique({
      where: { id: token },
      select: {
        User: {
          select: {
            id: true,
            username: true,
            Twitch: {
              select: {
                refreshToken: true
              }
            }
          }
        }
      }
    });
    if (!twitchToken)
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Does not find twitch token');
    if (!twitchToken.User.Twitch)
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Does not find twitch');
    //#endregion

    //#region Refresh token
    const refreshResult = await refreshToken(twitchToken.User.Twitch.refreshToken);
    //#endregion

    //#region Check required scopes to equal default scopes
    let hasNotRequiredScope = false;
    getDefaultScopes().forEach((scope) => {
      if (hasNotRequiredScope) return;
      hasNotRequiredScope = !refreshResult.scope.includes(scope);
    });

    if (hasNotRequiredScope) {
      res.clearCookie('at').clearCookie('rt');
      throw new ApiError(StatusCodes.FORBIDDEN, 'Required scopes are not equals default scopes');
    }
    //#endregion

    //#region Update Twitch, add access and refresh tokens
    await prisma.twitch.update({
      data: {
        accessToken: refreshResult.access_token,
        refreshToken: refreshResult.refresh_token
      },
      where: {
        userId: twitchToken.User.id
      }
    });
    //#endregion

    res.status(StatusCodes.OK).json({
      accessToken: refreshResult.access_token,
      userId: twitchToken.User.id,
      user: twitchToken.User.username,
      clientId: process.env.TWITCH_CLIENT_ID,
      scope: refreshResult.scope
    });
  })
);

export default twitch;
