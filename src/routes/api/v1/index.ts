import auth from '$routes/api/v1/auth';
import chat from '$routes/api/v1/chat';
import { Router } from 'express';

const apiV1 = Router();

apiV1.use('/auth', auth);
apiV1.use('/chat', chat);

export default apiV1;
