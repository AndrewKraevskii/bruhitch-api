import { Router } from 'express';
import callback from './callback';
import settings from './settings';

const follow = Router();

follow.use('/callback', callback);
follow.use('/settings', settings);

export default follow;
