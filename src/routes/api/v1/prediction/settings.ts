import { PredictionSettings, User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../../../lib/db';
import { getErrorMessage } from '../../../../lib/error';
import { getDataFromJWTToken, verifyJWTToken } from '../../../../lib/jwt';

const settings = Router();

settings.get('/', async (req, res) => {
  const { token } = req.query as { token: string };
  if (!token) return res.status(StatusCodes.BAD_REQUEST).json(getErrorMessage('undefined token'));

  let predictionSettings: PredictionSettings;
  try {
    const t = await prisma.twitchToken.findUnique({
      where: {
        id: token
      },
      select: {
        User: {
          select: {
            PredictionSettings: true
          }
        }
      }
    });
    if (!t) return res.status(StatusCodes.NOT_FOUND).json({});

    predictionSettings = t.User.PredictionSettings;
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('problem with get follow settings'));
  }

  if (predictionSettings) {
    delete predictionSettings.id;
    delete predictionSettings.userId;
  }

  res.status(StatusCodes.OK).json(predictionSettings);
});

settings.post('/', async (req, res) => {
  const { at } = req.cookies as { at: string | undefined };
  if (!at) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('incorrect access_token'));

  if (!verifyJWTToken(at))
    return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid access_token'));

  const atData = getDataFromJWTToken<User>(at);

  const data: PredictionSettings = req.body;

  data.id = undefined;
  data.userId = undefined;

  let predictionSettings: PredictionSettings;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: atData.id
      },
      select: {
        id: true,
        PredictionSettings: true
      }
    });
    if (!user)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(getErrorMessage('problem with get user'));
    if (user.PredictionSettings) {
      predictionSettings = user.PredictionSettings;
    } else {
      predictionSettings = await prisma.predictionSettings.create({
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
    .filter((k) => k in predictionSettings)
    .forEach((k) => {
      newData[k] = (data as any)[k];
    });

  delete newData.id, delete newData.userId;

  try {
    predictionSettings = await prisma.predictionSettings.update({
      data: {
        ...newData
      },
      where: {
        id: predictionSettings.id
      }
    });
  } catch (e) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(getErrorMessage('problem with save follow settings'));
  }

  delete predictionSettings.id;
  delete predictionSettings.userId;

  res.status(StatusCodes.OK).json(predictionSettings);
});

export default settings;
