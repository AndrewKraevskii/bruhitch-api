import { SubscribeSettings, User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import { getDataFromJWTToken, verifyJWTToken } from '../../../../lib/jwt';

const settings = Router();

settings.get('/', async (req, res) => {
  const { token } = req.query as { token: string };
  if (!token) return res.status(StatusCodes.BAD_REQUEST).json(getErrorMessage('undefined token'));

  let subscribeSettings: SubscribeSettings;
  try {
    const t = await prisma.twitchToken.findUnique({
      where: {
        id: token
      },
      select: {
        User: {
          select: {
            SubscribeSettings: true
          }
        }
      }
    });
    if (!t) return res.status(StatusCodes.NOT_FOUND).json({});

    subscribeSettings = t.User.SubscribeSettings;
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('problem with get follow settings'));
  }

  if (subscribeSettings) {
    delete subscribeSettings.id;
    delete subscribeSettings.userId;
  }

  res.status(StatusCodes.OK).json(subscribeSettings);
});

settings.post('/', async (req, res) => {
  const { at } = req.cookies as { at: string | undefined };
  if (!at) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('incorrect access_token'));

  if (!verifyJWTToken(at))
    return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid access_token'));

  const atData = getDataFromJWTToken<User>(at);

  const data: SubscribeSettings = req.body;

  data.id = undefined;
  data.userId = undefined;

  let subscribeSettings: SubscribeSettings;
  let isNew = false;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: atData.id
      },
      select: {
        id: true,
        SubscribeSettings: true
      }
    });
    if (!user)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorMessage('problem with get user'));
    if (user.SubscribeSettings) {
      subscribeSettings = user.SubscribeSettings;
    } else {
      subscribeSettings = await prisma.subscribeSettings.create({
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
    .filter((k) => k in subscribeSettings)
    .forEach((k) => {
      newData[k] = (data as any)[k];
    });

  delete newData.id, delete newData.userId;

  try {
    subscribeSettings = await prisma.subscribeSettings.update({
      data: {
        ...newData
      },
      where: {
        id: subscribeSettings.id
      }
    });
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('problem with save follow settings'));
  }

  delete subscribeSettings.id;
  delete subscribeSettings.userId;

  res.status(StatusCodes.OK).json(subscribeSettings);
});

export default settings;
