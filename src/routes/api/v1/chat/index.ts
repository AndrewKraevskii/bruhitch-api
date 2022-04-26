import { Router } from 'express';
import badges from './badges';
import link from './link';
import save from './save';

const chat = Router();

chat.use('/badges', badges);
chat.use('/save', save);
chat.use('/link', link);

export default chat;
