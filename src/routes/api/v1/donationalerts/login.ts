import getRedirectURI from '$donationalerts/getRedirectURI';
import getScopes from '$donationalerts/getScopes';
import handleErrorAsync from '$lib/handleErrorAsync';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const login = Router();

login.get(
  '/',
  handleErrorAsync(async (req, res) => {
    const url = new URL('https://www.donationalerts.com/oauth/authorize');

    url.searchParams.append('client_id', process.env.DONATIONALERTS_CLIENT_ID);
    url.searchParams.append(
      'redirect_uri',
      getRedirectURI(!!req.headers.host?.includes('localhost'))
    );
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', getScopes().join(' '));

    res.status(StatusCodes.TEMPORARY_REDIRECT).redirect(url.href);
  })
);

export default login;
