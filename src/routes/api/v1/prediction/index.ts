import callback from '$routes/api/v1/prediction/callback';
import settings from '$routes/api/v1/prediction/settings';
import { Router } from 'express';

const prediction = Router();

prediction.use('/settings', settings);
prediction.use('/callback', callback);

export default prediction;
