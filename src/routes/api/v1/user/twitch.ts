import { User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import { getDataFromJWTToken, verifyJWTToken } from '../../../../lib/jwt';

const twitch = Router();

twitch.get('/', async (req, res) => {
  const { at } = req.cookies as { at: string | undefined };
  if (!at) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('incorrect access_token'));

  if (!verifyJWTToken(at))
    return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid access_token'));

  const user = getDataFromJWTToken<User>(at);

  try {
    const token = await prisma.twitchToken.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    res.status(StatusCodes.OK).json(token);
  } catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(getErrorMessage('error on delete user'));
  }
});

export default twitch;
