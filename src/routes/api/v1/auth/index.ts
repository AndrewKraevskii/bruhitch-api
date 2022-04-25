import { Router } from 'express';
import callback from './callback';
import login from './login';
import logout from './logout';
import refresh from './refresh';

const auth = Router();

auth.use('/callback', callback);
auth.use('/refresh', refresh);
auth.use('/login', login);
auth.use('/logout', logout);

export default auth;
