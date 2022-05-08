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

    //#region Delete user and revoke twitch access token
    try {
      const userEntity = await prisma.user.delete({
        where: { id: user.id },
        select: {
          Twitch: {
            select: {
              accessToken: true
            }
          }
        }
      });
      if (userEntity && userEntity.Twitch) {
        await revokeAccessToken(userEntity.Twitch.accessToken);
      }
    } catch (e) {}
    //#endregion

    //#region Delete user
    //#endregion

    res.status(StatusCodes.OK).json(user);
  })
);

export default remove;
