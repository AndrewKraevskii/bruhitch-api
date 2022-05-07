import callback from '$routes/api/v1/auth/callback';
import login from '$routes/api/v1/auth/login';
import logout from '$routes/api/v1/auth/logout';
import refresh from '$routes/api/v1/auth/refresh';
import { Router } from 'express';

const auth = Router();

auth.use('/login', login);
auth.use('/logout', logout);
auth.use('/callback', callback);
auth.use('/refresh', refresh);

export default auth;
