import { User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import { getDataFromJWTToken, verifyJWTToken } from '../../../../lib/jwt';
import revokeAccessToken from '../../../../lib/revokeAccessToken';

const remove = Router();

remove.post('/', async (req, res) => {
  const { at } = req.cookies as { at: string | undefined };
  if (!at) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('incorrect access_token'));

  if (!verifyJWTToken(at))
    return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid access_token'));

  const user = getDataFromJWTToken<User>(at);

  try {
    const tokens = await prisma.twitch.findUnique({
      where: { userId: user.id },
      select: {
        accessToken: true
      }
    });
    if (tokens && tokens.accessToken) {
      await revokeAccessToken(tokens.accessToken);
    }
  } catch (e) {}

  try {
    await prisma.user.delete({ where: { id: user.id } });
    res.status(StatusCodes.OK).json(user);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(getErrorMessage('error on delete user'));
  }
});

export default remove;
