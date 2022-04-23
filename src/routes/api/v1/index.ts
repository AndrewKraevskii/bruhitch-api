import { Router } from 'express';
import chat from './chat';

const apiV1 = Router();

apiV1.use('/chat', chat);

export default apiV1;
