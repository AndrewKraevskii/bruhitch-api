import { Router } from 'express';
import remove from './remove';
import token from './token';
import twitch from './twitch';

const user = Router();

user.use('/remove', remove);
user.use('/token', token);
user.use('/twitch', twitch);

export default user;
