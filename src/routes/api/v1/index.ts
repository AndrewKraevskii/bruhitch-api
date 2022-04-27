import { Router } from 'express';
import auth from './auth';
import chat from './chat';
import follow from './follow';
import user from './user';

const apiV1 = Router();

apiV1.use('/auth', auth);
apiV1.use('/chat', chat);
apiV1.use('/user', user);
apiV1.use('/follow', follow);

export default apiV1;
