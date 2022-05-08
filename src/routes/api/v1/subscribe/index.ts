import settings from '$routes/api/v1/subscribe/settings';
import { Router } from 'express';

const subscribe = Router();

subscribe.use('/settings', settings);

export default subscribe;
