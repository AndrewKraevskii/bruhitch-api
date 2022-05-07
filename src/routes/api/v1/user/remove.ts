import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import handleErrorAsync from '$lib/handleErrorAsync';
import { getDataFromJWTToken, verifyJWTToken } from '$lib/jwt';
import revokeAccessToken from '$lib/revokeAccessToken';
import { User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const remove = Router();

remove.delete(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for access token
    const { at } = req.cookies as { [key: string]: string | undefined };
    if (!at) throw new ApiError(StatusCodes.FORBIDDEN, 'Incorrect access token');
    //#endregion

    //#region Validate access token
    if (!verifyJWTToken(at)) throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid access token');
    //#endregion

    let user = getDataFromJWTToken<User>(at);

    //#region Find and revoke twitch access token
    const tokens = await prisma.twitch.findUnique({
      where: { userId: user.id },
      select: {
        accessToken: true
      }
    });
    if (tokens && tokens.accessToken) {
      await revokeAccessToken(tokens.accessToken);
    }
    //#endregion

    //#region Delete user
    try {
      user = await prisma.user.delete({ where: { id: user.id } });
    } catch (e) {}
    //#endregion

    res.status(StatusCodes.OK).json(user);
  })
);

export default remove;
