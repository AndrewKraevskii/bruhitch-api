import fetch from 'cross-fetch';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getErrorMessage } from '../../../../lib/error';
import getEnv from '../../../../lib/getEnv';
import getScopes from '../../../../lib/getScopes';
import getUserData from '../../../../lib/getUserInfo';
import { Environment } from '../../../../types/env';
import { OAuthToken, TwitchError, UserData } from '../../../../types/twitch';

const callback = Router();

const getToken = async (code: string): Promise<OAuthToken | TwitchError> => {
  const url = new URL('https://id.twitch.tv/oauth2/token');

  url.searchParams.append('client_id', getEnv(Environment.TwitchClientId));
  url.searchParams.append('client_secret', getEnv(Environment.TwitchSecretKey));
  url.searchParams.append('redirect_uri', getEnv(Environment.RedirectUri));
  url.searchParams.append('code', code);
  url.searchParams.append('grant_type', 'authorization_code');

  return await fetch(url.href, { method: 'POST' })
    .then((r) => r.json())
    .catch(console.error);
};

callback.get('/', async (req, res) => {
  const { code, scope, error, error_description } = req.query as {
    [key: string]: string | undefined;
  };

  if (error) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage(error_description));

  if (!code) return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid code'));

  if (JSON.stringify(scope?.split(' ')?.filter(Boolean)) !== JSON.stringify(getScopes()))
    return res.status(StatusCodes.FORBIDDEN).json(getErrorMessage('invalid scopes'));

  const resToken = await getToken(code);

  let maybeError = resToken as TwitchError;
  if (maybeError.status)
    return res.status(maybeError.status).json(getErrorMessage(maybeError.message));
  const token = resToken as OAuthToken;

  const resData = await getUserData(token.access_token);
  maybeError = resData as TwitchError;
  if (maybeError.status)
    return res.status(maybeError.status).json(getErrorMessage(maybeError.message));
  const userInfo = resData as UserData;

  res.status(StatusCodes.PERMANENT_REDIRECT).redirect('/');
});

export default callback;
