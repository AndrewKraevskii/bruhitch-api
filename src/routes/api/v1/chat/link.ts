import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import handleErrorAsync from '$lib/handleErrorAsync';
import { getDataFromJWTToken, verifyJWTToken } from '$lib/jwt';
import { User } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const link = Router();

link.get(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for access token
    const { at } = req.cookies as { [key: string]: string | undefined };
    if (!at) throw new ApiError(StatusCodes.FORBIDDEN, 'Incorrect access token');
    //#endregion

    //#region Validate access token
    if (!verifyJWTToken(at)) throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid access token');
    //#endregion

    //#region Get chat settings link
    const user = getDataFromJWTToken<User>(at);
    const chatSettings = await prisma.chatSettings.findUnique({
      where: {
        userId: user.id
      }
    });
    //#endregion

    res.status(StatusCodes.OK).json({ link: chatSettings?.link ? chatSettings?.link : null });
  })
);

link.post(
  '/',
  handleErrorAsync(async (req, res) => {
    //#region Check for link
    const { link } = req.body as { [key: string]: string | undefined };
    if (!link) throw new ApiError(StatusCodes.BAD_REQUEST, 'Incorrect link');
    //#endregion

    //#region Check for access token
    const { at } = req.cookies as { [key: string]: string | undefined };
    if (!at) throw new ApiError(StatusCodes.FORBIDDEN, 'Incorrect access token');
    //#endregion

    //#region Validate access token
    if (!verifyJWTToken(at)) throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid access token');
    //#endregion

    //#region Get chat settings link
    const user = getDataFromJWTToken<User>(at);
    const chatSettings = await prisma.chatSettings.upsert({
      where: {
        userId: user.id
      },
      update: { link },
      create: {
        userId: user.id,
        link
      }
    });
    //#endregion

    res.status(StatusCodes.OK).json({ link: chatSettings.link });
  })
);

export default link;
