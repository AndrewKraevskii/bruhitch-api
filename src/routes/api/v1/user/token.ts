import { User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import refreshToken from '../../../../lib/refreshToken';
import { RefreshToken, TwitchError } from '../../../../types/twitch';

const token = Router();

token.get('/', async (req, res) => {
  const { token } = req.query as { token: string | undefined };
  if (!token) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('incorrect token'));

  let user: User;
  try {
    const twitchToken = await prisma.twitchToken.findUnique({
      where: { id: token },
      select: { User: true }
    });
    if (!twitchToken || !twitchToken.User)
      return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid token'));
    user = twitchToken.User;
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(getErrorMessage('error on get token'));
  }

  let at: string;
  let rt: string;
  try {
    const tokens = await prisma.twitch.findUnique({
      where: { userId: user.id },
      select: { accessToken: true, refreshToken: true }
    });
    if (!tokens || !tokens.accessToken || !tokens.refreshToken)
      return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('error on get tokens'));
    at = tokens.accessToken;
    rt = tokens.refreshToken;
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(getErrorMessage('error on get tokens'));
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
      userId: user.id
    }
  });

  res.status(StatusCodes.OK).json({ id: user.id, accessToken: data.access_token });
});

export default token;
