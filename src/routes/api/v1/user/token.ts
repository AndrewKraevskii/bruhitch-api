import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import handleErrorAsync from '$lib/handleErrorAsync';
import { getDataFromJWTToken, verifyJWTToken } from '$lib/jwt';
import { TwitchToken, User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const token = Router();

token.get(
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

    //#region Get token
    let token = await prisma.twitchToken.findUnique({
      where: {
        userId: user.id
      }
    });
    //#endregion

    res.status(StatusCodes.OK).json({ token });
  })
);

token.patch(
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

    //#region Get token
    let token: TwitchToken;
    try {
      token = await prisma.twitchToken.delete({
        where: {
          userId: user.id
        }
      });
    } catch (e) {}
    token = await prisma.twitchToken.create({ data: { userId: user.id } });
    //#endregion

    res.status(StatusCodes.OK).json({ token });
  })
);

export default token;
