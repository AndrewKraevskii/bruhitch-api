import { RefreshToken, User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import {
  generateJWTToken,
  generateRefreshToken,
  getDataFromJWTToken,
  verifyJWTToken
} from '../../../../lib/jwt';

const refresh = Router();

refresh.post('/', async (req, res) => {
  const { rt } = req.cookies as { rt: string };

  if (!rt) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .clearCookie('at')
      .clearCookie('rt')
      .json(getErrorMessage('incorrect refresh token'));
  }

  if (!verifyJWTToken(rt)) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .clearCookie('at')
      .clearCookie('rt')
      .json(getErrorMessage('invalid refresh token'));
  }

  const data = getDataFromJWTToken<RefreshToken>(rt);

  let user: User;
  try {
    user = (
      await prisma.refreshToken.delete({
        where: {
          id: data.id
        },
        select: {
          User: true
        }
      })
    ).User;
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .clearCookie('at')
      .clearCookie('rt')
      .json(getErrorMessage('user does not find by refresh token'));
  }

  const refreshTokenEntity = await prisma.refreshToken.create({
    data: {
      userId: user.id
    }
  });

  const accessToken = generateJWTToken(user);
  const refreshToken = generateRefreshToken(refreshTokenEntity.id);

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

  res.status(StatusCodes.OK).json(user);
});

export default refresh;
