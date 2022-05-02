import { Router } from 'express';
import remove from './remove';
import token from './token';
import twitch from './twitch';

const index = Router();

index.use('/remove', remove);
index.use('/twitch', twitch);
index.use('/token', token);

export default index;
