import auth from '$routes/api/v1/auth';
import chat from '$routes/api/v1/chat';
import donationAlerts from '$routes/api/v1/donationalerts';
import follow from '$routes/api/v1/follow';
import prediction from '$routes/api/v1/prediction';
import subscribe from '$routes/api/v1/subscribe';
import user from '$routes/api/v1/user';
import { Router } from 'express';

const apiV1 = Router();

apiV1.use('/auth', auth);
apiV1.use('/donationalerts', donationAlerts);
apiV1.use('/chat', chat);
apiV1.use('/user', user);
apiV1.use('/subscribe', subscribe);
apiV1.use('/follow', follow);
apiV1.use('/prediction', prediction);

export default apiV1;
