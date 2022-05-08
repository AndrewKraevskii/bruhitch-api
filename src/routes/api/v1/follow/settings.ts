import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import handleErrorAsync from '$lib/handleErrorAsync';
import { getDataFromJWTToken, verifyJWTToken } from '$lib/jwt';
import { FollowSettings, User } from '@prisma/client';
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

    //#region Get follow settings by twitch token
    const twitchToken = await prisma.twitchToken.findUnique({
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
    if (!twitchToken) throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid token');
    const followSettings = twitchToken.User.FollowSettings;
    //#endregion

    //#region Delete private fields
    if (followSettings) {
      (followSettings.id as any) = undefined;
      (followSettings.userId as any) = undefined;
    }
    //#endregion

    res.status(StatusCodes.OK).json(followSettings);
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

    //#region Update or subscribe settings
    const data: FollowSettings = req.body;

    (data as any).id = undefined;
    (data as any).userId = undefined;

    let newData: any = {};

    Object.keys(data).forEach((k) => {
      newData[k] = (data as any)[k];
    });

    const followSettings = await prisma.followSettings.upsert({
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
    if (followSettings) {
      (followSettings.id as any) = undefined;
      (followSettings.userId as any) = undefined;
    }
    //#endregion

    res.status(StatusCodes.OK).json(followSettings);
  })
);

export default settings;
