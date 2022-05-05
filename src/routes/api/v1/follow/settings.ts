import { FollowSettings, User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import { getDataFromJWTToken, verifyJWTToken } from '../../../../lib/jwt';

const settings = Router();

settings.get('/', async (req, res) => {
  const { token } = req.query as { token: string };
  if (!token) return res.status(StatusCodes.BAD_REQUEST).json(getErrorMessage('undefined token'));

  let followSettings: FollowSettings;
  try {
    const t = await prisma.twitchToken.findUnique({
      where: {
        id: token
      },
      select: {
        User: {
          select: {
            FollowSettings: true
          }
        }
      }
    });
    if (!t) return res.status(StatusCodes.NOT_FOUND).json({});

    followSettings = t.User.FollowSettings;
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('problem with get follow settings'));
  }

  if (followSettings) {
    delete followSettings.id;
    delete followSettings.userId;
  }

  res.status(StatusCodes.OK).json(followSettings);
});

settings.post('/', async (req, res) => {
  const { at } = req.cookies as { at: string | undefined };
  if (!at) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('incorrect access_token'));

  if (!verifyJWTToken(at))
    return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid access_token'));

  const atData = getDataFromJWTToken<User>(at);

  const data: FollowSettings = req.body;

  data.id = undefined;
  data.userId = undefined;

  let followSettings: FollowSettings;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: atData.id
      },
      select: {
        id: true,
        FollowSettings: true
      }
    });
    if (!user)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorMessage('problem with get user'));
    if (user.FollowSettings) {
      followSettings = user.FollowSettings;
    } else {
      followSettings = await prisma.followSettings.create({
        data: {
          userId: user.id
        }
      });
    }
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('problem with get follow settings'));
  }

  let newData: any = {};

  Object.keys(data)
    .filter((k) => k in followSettings)
    .forEach((k) => {
      newData[k] = (data as any)[k];
    });

  delete newData.id, delete newData.userId;

  try {
    followSettings = await prisma.followSettings.update({
      data: {
        ...newData
      },
      where: {
        id: followSettings.id
      }
    });
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('problem with save follow settings'));
  }

  delete followSettings.id;
  delete followSettings.userId;

  res.status(StatusCodes.OK).json(followSettings);
});

export default settings;
