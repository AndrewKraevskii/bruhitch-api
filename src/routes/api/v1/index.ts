import auth from '$routes/api/v1/auth';
import { Router } from 'express';

const apiV1 = Router();

apiV1.use('/auth', auth);

export default apiV1;
