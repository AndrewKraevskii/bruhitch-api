import { Router } from 'express';
import badges from './badges';
import link from './link';

const chat = Router();

chat.use('/badges', badges);
chat.use('/link', link);

export default chat;
