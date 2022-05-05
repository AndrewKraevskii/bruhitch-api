import { Router } from 'express';
import auth from './auth';
import chat from './chat';
import follow from './follow';
import prediction from './prediction';
import subscribe from './subscribe';
import user from './user';

const apiV1 = Router();

apiV1.use('/auth', auth);
apiV1.use('/chat', chat);
apiV1.use('/user', user);
apiV1.use('/follow', follow);
apiV1.use('/subscribe', subscribe);
apiV1.use('/prediction', prediction);

export default apiV1;
