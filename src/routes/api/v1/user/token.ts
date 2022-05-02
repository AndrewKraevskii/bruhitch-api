import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import getEnv from '../../../../lib/getEnv';
import refreshToken from '../../../../lib/refreshToken';
import { Environment } from '../../../../types/env';
import { RefreshToken, TwitchError } from '../../../../types/twitch';

const token = Router();

token.get('/', async (req, res) => {
  const { token } = req.query as { token: string | undefined };
  if (!token) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('incorrect token'));

  let userId: string;
  let rt: string;
  try {
    const twitchToken = await prisma.twitchToken.findUnique({
      where: { id: token },
      select: {
        User: {
          select: {
            id: true,
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
    userId = twitchToken.User.id;
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

  await prisma.twitch.update({
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    },
    where: {
      userId: userId
    }
  });

  res.status(StatusCodes.OK).json({
    accessToken: data.access_token,
    clientId: getEnv(Environment.TwitchClientId),
    scope: data.scope
  });
});

export default token;
