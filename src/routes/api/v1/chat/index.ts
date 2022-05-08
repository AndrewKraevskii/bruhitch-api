import badges from '$routes/api/v1/chat/badges';
import link from '$routes/api/v1/chat/link';
import { Router } from 'express';

const chat = Router();

chat.use('/badges', badges);
chat.use('/link', link);

export default chat;
