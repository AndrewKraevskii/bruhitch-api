import { User } from '@prisma/client';
import fetch from 'cross-fetch';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import getEnv from '../../../../lib/getEnv';
import getScopes from '../../../../lib/getScopes';
import getUserData from '../../../../lib/getUserInfo';
import { generateJWTToken, generateRefreshToken } from '../../../../lib/jwt';
import { Environment } from '../../../../types/env';
import { OAuthToken, TwitchError, UserData } from '../../../../types/twitch';

const callback = Router();

const getToken = async (code: string, redirectUri: string): Promise<OAuthToken | TwitchError> => {
  const url = new URL('https://id.twitch.tv/oauth2/token');

  url.searchParams.append('client_id', getEnv(Environment.TwitchClientId));
  url.searchParams.append('client_secret', getEnv(Environment.TwitchSecretKey));
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('code', code);
  url.searchParams.append('grant_type', 'authorization_code');

  return await fetch(url.href, { method: 'POST' })
    .then((r) => r.json())
    .catch(console.error);
};

callback.get('/', async (req, res) => {
  const { code, scope, error, error_description } = req.query as {
    [key: string]: string | undefined;
  };

  if (error) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage(error_description));

  if (!code) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid code'));

  if (JSON.stringify(scope?.split(' ')?.filter(Boolean)) !== JSON.stringify(getScopes()))
    return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid scopes'));

  let host = req.headers.host?.includes('localhost')
    ? 'http://localhost/api/v1/auth/callback'
    : 'https://bruhitch.vercel.app/api/v1/auth/callback';
  const resToken = await getToken(code, host);

  let maybeError = resToken as TwitchError;
  if (maybeError.status) return res.status(406).json(getErrorMessage(maybeError.message));
  const token = resToken as OAuthToken;

  const resData = await getUserData(token.access_token);
  maybeError = resData as TwitchError;
  if (maybeError.status) return res.status(406).json(getErrorMessage(maybeError.message));
  const userInfo = resData as UserData;

  let user: User = await prisma.user.findUnique({ where: { id: userInfo.sub } });
  if (!user) {
    user = await prisma.user.create({
      data: { id: userInfo.sub, username: userInfo.preferred_username, avatar: userInfo.picture }
    });

    await prisma.twitch.create({
      data: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        userId: user.id
      }
    });

    await prisma.twitchToken.create({
      data: {
        userId: user.id
      }
    });
  } else {
    await prisma.twitch.update({
      data: {
        accessToken: token.access_token,
        refreshToken: token.refresh_token
      },
      where: {
        userId: user.id
      }
    });

    await prisma.refreshToken.delete({ where: { userId: user.id } });
  }

  let refreshTokenEntity = await prisma.refreshToken.create({
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

  res.status(StatusCodes.PERMANENT_REDIRECT).redirect('/');
});

export default callback;
