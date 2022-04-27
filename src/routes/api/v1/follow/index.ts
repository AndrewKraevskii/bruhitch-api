import { Router } from 'express';
import callback from './callback';

const follow = Router();

follow.use('/callback', callback);

export default follow;
