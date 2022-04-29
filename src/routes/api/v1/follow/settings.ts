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
        FollowSettings: true
      }
    });
    if (!t) return res.status(StatusCodes.NOT_FOUND).json({});

    followSettings = t.FollowSettings;
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('problem with get follow settings'));
  }

  delete followSettings.id;
  delete followSettings.twitchTokenId;

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
  data.twitchTokenId = undefined;

  let followSettings: FollowSettings;
  let isNew = false;
  try {
    const token = await prisma.twitchToken.findUnique({
      where: {
        userId: atData.id
      },
      select: {
        id: true,
        FollowSettings: true
      }
    });
    if (!token)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorMessage('problem with get token'));
    if (token.FollowSettings) {
      followSettings = token.FollowSettings;
    } else {
      followSettings = await prisma.followSettings.create({
        data: {
          twitchTokenId: token.id
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

  delete newData.id, delete newData.twitchTokenId;

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
  delete followSettings.twitchTokenId;

  res.status(StatusCodes.OK).json(followSettings);
});

export default settings;
