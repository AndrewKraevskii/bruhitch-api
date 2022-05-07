import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import handleErrorAsync from '$lib/handleErrorAsync';
import {
  generateJWTToken,
  generateRefreshToken,
  getDataFromJWTToken,
  verifyJWTToken
} from '$lib/jwt';
import { RefreshToken } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const refresh = Router();

refresh.post(
  '/',
  handleErrorAsync(async (req, res) => {
    const { rt } = req.cookies as { rt: string };

    //#region Check for refresh token
    if (!rt) {
      res.clearCookie('at').clearCookie('rt');
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Incorrect refresh token');
    }
    //#endregion

    //#region Validate refresh token
    if (!verifyJWTToken(rt)) {
      res.clearCookie('at').clearCookie('rt');
      throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid refresh token');
    }
    //#endregion

    //#region Get User from refresh token
    const { id: refreshTokenId } = getDataFromJWTToken<RefreshToken>(rt);

    const user = (
      await prisma.refreshToken.findUnique({
        where: {
          id: refreshTokenId
        },
        select: { User: true }
      })
    )?.User;

    if (!user) {
      res.clearCookie('at').clearCookie('rt');
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'User does not find by refresh token');
    }
    //#endregion

    //#region Update refresh token
    await prisma.refreshToken.delete({ where: { id: refreshTokenId } });
    let refreshTokenEntity = await prisma.refreshToken.create({
      data: {
        userId: user.id
      }
    });

    const accessToken = generateJWTToken(user);
    const refreshToken = generateRefreshToken(refreshTokenEntity.id);
    //#endregion

    //#region Set tokens into cookie
    res
      .cookie('at', accessToken.token, {
        maxAge: accessToken.expiresIn * 1000,
        path: '/',
        secure: req.secure,
        httpOnly: true,
        sameSite: 'strict'
      })
      .cookie('rt', refreshToken.token, {
        maxAge: refreshToken.expiresIn * 1000,
        path: '/',
        secure: req.secure,
        httpOnly: true,
        sameSite: 'strict'
      });
    //#endregion

    res.status(StatusCodes.OK).json(user);
  })
);

export default refresh;
