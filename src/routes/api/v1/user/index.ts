import remove from '$routes/api/v1/user/remove';
import token from '$routes/api/v1/user/token';
import twitch from '$routes/api/v1/user/twitch';
import { Router } from 'express';

const user = Router();

user.use('/remove', remove);
user.use('/token', token);
user.use('/twitch', twitch);

export default user;
