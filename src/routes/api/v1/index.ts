import { Router } from 'express';
import auth from './auth';
import chat from './chat';

const apiV1 = Router();

apiV1.use('/auth', auth);
apiV1.use('/chat', chat);

export default apiV1;
