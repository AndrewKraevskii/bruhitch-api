import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import handleErrorAsync from '$lib/handleErrorAsync';
import { getDataFromJWTToken, verifyJWTToken } from '$lib/jwt';
import { PredictionSettings, User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const settings = Router();

settings.get(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for twitch token
    const { token } = req.query as { [key: string]: string | undefined };
    if (!token) throw new ApiError(StatusCodes.FORBIDDEN, 'Incorrect token');
    //#endregion

    //#region Get prediction settings by twitch token
    const twitchToken = await prisma.twitchToken.findUnique({
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
    if (!twitchToken) throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid token');
    const predictionSettings = twitchToken.User.PredictionSettings;
    //#endregion

    //#region Delete private fields
    if (predictionSettings) {
      (predictionSettings.id as any) = undefined;
      (predictionSettings.userId as any) = undefined;
    }
    //#endregion

    res.status(StatusCodes.OK).json(predictionSettings);
  })
);

settings.post(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for access token
    const { at } = req.cookies as { [key: string]: string | undefined };
    if (!at) throw new ApiError(StatusCodes.FORBIDDEN, 'Incorrect access token');
    //#endregion

    //#region Validate access token
    if (!verifyJWTToken(at)) throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid access token');
    //#endregion

    const atData = getDataFromJWTToken<User>(at);

    //#region Update or create subscribe settings
    const data: PredictionSettings = req.body;

    (data as any).id = undefined;
    (data as any).userId = undefined;

    let newData: any = {};

    Object.keys(data).forEach((k) => {
      newData[k] = (data as any)[k];
    });

    const predictionSettings = await prisma.predictionSettings.upsert({
      where: {
        userId: atData.id
      },
      create: {
        ...newData,
        userId: atData.id
      },
      update: {
        ...newData
      }
    });
    //#endregion

    //#region Delete private fields
    if (predictionSettings) {
      (predictionSettings.id as any) = undefined;
      (predictionSettings.userId as any) = undefined;
    }
    //#endregion

    res.status(StatusCodes.OK).json(predictionSettings);
  })
);

export default settings;
