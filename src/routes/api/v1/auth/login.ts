import getDefaultScopes from '$lib/getDefaultScopes';
import handleErrorAsync from '$lib/handleErrorAsync';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const login = Router();

const claims: object = {
  userinfo: {
    email: null,
    email_verified: null,
    picture: null,
    preferred_username: null
  }
};

login.get(
  '/',
  handleErrorAsync(async (req, res) => {
    const url = new URL('https://id.twitch.tv/oauth2/authorize');

    let host = req.headers.host?.includes('localhost')
      ? 'http://localhost/api/v1/auth/callback'
      : 'https://bruhitch.vercel.app/api/v1/auth/callback';

    url.searchParams.append('claims', JSON.stringify(claims));
    url.searchParams.append('client_id', process.env.TWITCH_CLIENT_ID);
    url.searchParams.append('redirect_uri', host);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', getDefaultScopes().join(' '));

    res.status(StatusCodes.TEMPORARY_REDIRECT).redirect(url.href);
  })
);

export default login;
