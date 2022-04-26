import { User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import { getDataFromJWTToken, verifyJWTToken } from '../../../../lib/jwt';

const link = Router();

link.get('/', async (req, res) => {
  const { at } = req.cookies as { at: string | undefined };
  if (!at) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('incorrect access_token'));

  if (!verifyJWTToken(at))
    return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid access_token'));

  const user = getDataFromJWTToken<User>(at);

  try {
    const { link } = await prisma.chatSettings.findUnique({
      where: {
        userId: user.id
      },
      select: {
        link: true
      }
    });
    res.status(StatusCodes.OK).json({ link });
  } catch (e) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(getErrorMessage('error on get link'));
  }
});

export default link;
