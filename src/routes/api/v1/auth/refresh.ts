import { RefreshToken } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { decodeFromBase64 } from '../../../../lib/base64';
import { prisma } from '../../../../lib/db';
import { generateJWTToken, generateRefreshToken, verifyJWTToken } from '../../../../lib/jwt';

const refresh = Router();

refresh.get('/', async (req, res) => {
  const { rt } = req.cookies;

  if (!rt) {
    return res
      .status(StatusCodes.PERMANENT_REDIRECT)
      .clearCookie('at')
      .clearCookie('rt')
      .redirect('/');
  }

  if (!verifyJWTToken(rt)) {
    return res
      .status(StatusCodes.PERMANENT_REDIRECT)
      .clearCookie('at')
      .clearCookie('rt')
      .redirect('/');
  }

  const [, payload] = rt.split('.');

  const data: RefreshToken = JSON.parse(decodeFromBase64(payload));

  const oldRefreshToken = await prisma.refreshToken.findFirst({
    where: {
      id: data.id,
      userId: data.userId
    },
    select: {
      User: true
    }
  });

  if (!oldRefreshToken) {
    return res
      .status(StatusCodes.PERMANENT_REDIRECT)
      .clearCookie('at')
      .clearCookie('rt')
      .redirect('/');
  }
  await prisma.refreshToken.delete({
    where: {
      id: data.id
    },
    select: {
      User: true
    }
  });

  const refreshTokenEntity = await prisma.refreshToken.create({
    data: {
      userId: oldRefreshToken.User.id
    }
  });

  const accessToken = generateJWTToken(rt.User);
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

  res.status(StatusCodes.PERMANENT_REDIRECT).redirect('/');
});

export default refresh;
