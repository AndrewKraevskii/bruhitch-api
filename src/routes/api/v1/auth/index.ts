import { Router } from 'express';
import callback from './callback';
import login from './login';

const auth = Router();

auth.use('/callback', callback);
auth.use('/login', login);

export default auth;
