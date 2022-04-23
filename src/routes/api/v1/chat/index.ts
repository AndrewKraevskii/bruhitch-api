import { Router } from 'express';
import badges from './badges';

const chat = Router();

chat.use('/badges', badges);

export default chat;
