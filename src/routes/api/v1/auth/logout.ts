import handleErrorAsync from '$lib/handleErrorAsync';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const logout = Router();

logout.get(
  '/',
  handleErrorAsync(async (req, res) => {
    res.status(StatusCodes.PERMANENT_REDIRECT).clearCookie('at').clearCookie('rt').redirect('/');
  })
);

export default logout;
