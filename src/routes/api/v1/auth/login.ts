import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import getEnv from '../../../../lib/getEnv';
import getScopes from '../../../../lib/getScopes';
import { Environment } from '../../../../types/env';

const login = Router();

const claims: object = {
  userinfo: {
    email: null,
    email_verified: null,
    picture: null,
    preferred_username: null
  }
};

login.get('/', async (req, res) => {
  const url = new URL('https://id.twitch.tv/oauth2/authorize');

  url.searchParams.append('claims', JSON.stringify(claims));
  url.searchParams.append('client_id', getEnv(Environment.TwitchClientId));
  url.searchParams.append('redirect_uri', getEnv(Environment.RedirectUri));
  url.searchParams.append('response_type', 'code');
  url.searchParams.append('scope', getScopes().join(' '));

  res.status(StatusCodes.TEMPORARY_REDIRECT).redirect(url.href);
});

export default login;
