import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const logout = Router();

logout.get('/', async (req, res) => {
  res.status(StatusCodes.PERMANENT_REDIRECT).clearCookie('at').clearCookie('rt').redirect('/');
});

export default logout;
