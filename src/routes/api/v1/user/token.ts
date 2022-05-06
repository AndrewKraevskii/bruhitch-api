import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import getEnv from '../../../../lib/getEnv';
import getScopes from '../../../../lib/getScopes';
import refreshToken from '../../../../lib/refreshToken';
import { Environment } from '../../../../types/env';
import { RefreshToken, TwitchError } from '../../../../types/twitch';

const token = Router();

token.get('/', async (req, res) => {
  const { token } = req.query as { token: string | undefined };
  if (!token) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('incorrect token'));

  let user: {
    id: string;
    username: string;
    Twitch: {
      refreshToken: string;
    };
  };
  let rt: string;
  try {
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
      return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid token'));
    user = twitchToken.User;
    rt = twitchToken.User.Twitch.refreshToken;
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('error on get token'));
  }

  const refreshResult = await refreshToken(rt);
  const error = refreshResult as TwitchError;
  const data = refreshResult as RefreshToken;
  if (error.status) {
    return res.status(error.status).json(getErrorMessage(error.message));
  }

  let hasNotRequiredScope = false;
  getScopes().forEach((scope) => {
    if (hasNotRequiredScope) return;
    hasNotRequiredScope = !data.scope.includes(scope);
  });

  if (!hasNotRequiredScope) {
    return res.redirect('/api/v1/auth/logout');
  }

  await prisma.twitch.update({
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    },
    where: {
      userId: user.id
    }
  });

  res.status(StatusCodes.OK).json({
    accessToken: data.access_token,
    userId: user.id,
    user: user.username,
    clientId: getEnv(Environment.TwitchClientId),
    scope: data.scope
  });
});

export default token;
