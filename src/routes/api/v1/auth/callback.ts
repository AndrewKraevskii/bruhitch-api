import ApiError from '$exceptions/apiError';
import { prisma } from '$lib/db';
import getOAuthToken from '$lib/getOAuthToken';
import getUserData from '$lib/getUserData';
import handleErrorAsync from '$lib/handleErrorAsync';
import { generateJWTToken, generateRefreshToken } from '$lib/jwt';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const callback = Router();

callback.get(
  '/',
  handleErrorAsync(async (req, res) => {
    const { code, scope, error, error_description } = req.query as {
      [key: string]: string | undefined;
    };

    //#region Validate
    if (error) throw new ApiError(StatusCodes.FORBIDDEN, error_description ?? 'Twitch error');

    if (!code) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid code');
    //#endregion

    //#region Get OAuth Token
    let host = req.headers.host?.includes('localhost')
      ? 'http://localhost/api/v1/auth/callback'
      : 'https://bruhitch.vercel.app/api/v1/auth/callback';
    const token = await getOAuthToken(code, host);
    //#endregion

    //#region Get User Info
    const userInfo = await getUserData(token.access_token);
    //#endregion

    //#region Get or Create User. Twitch, TwitchToken included
    let user = await prisma.user.findUnique({
      where: {
        id: userInfo.sub
      }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userInfo.sub,
          username: userInfo.preferred_username,
          avatar: userInfo.picture,
          Twitch: {
            create: {
              accessToken: token.access_token,
              refreshToken: token.refresh_token
            }
          },
          TwitchToken: {
            create: {}
          }
        }
      });
    } else {
      user = await prisma.user.update({
        data: {
          Twitch: {
            update: {
              accessToken: token.access_token,
              refreshToken: token.refresh_token
            }
          },
          RefreshToken: {
            delete: true
          }
        },
        where: {
          id: user.id
        }
      });
    }
    //#endregion

    //#region Generate Tokens
    let refreshTokenEntity = await prisma.refreshToken.create({
      data: {
        userId: user.id
      }
    });

    const accessToken = generateJWTToken(user);
    const refreshToken = generateRefreshToken(refreshTokenEntity.id);
    //#endregion

    //#region Set tokens into cookie
    res
      .cookie('at', accessToken.token, {
        maxAge: accessToken.expiresIn * 1000,
        path: '/',
        secure: req.secure,
        httpOnly: true,
        sameSite: 'strict'
      })
      .cookie('rt', refreshToken.token, {
        maxAge: refreshToken.expiresIn * 1000,
        path: '/',
        secure: req.secure,
        httpOnly: true,
        sameSite: 'strict'
      });
    //#endregion

    res.status(StatusCodes.PERMANENT_REDIRECT).redirect('/');
  })
);

export default callback;
