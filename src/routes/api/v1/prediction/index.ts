import { Router } from 'express';
import callback from './callback';
import settings from './settings';

const prediction = Router();

prediction.use('/callback', callback);
prediction.use('/settings', settings);

export default prediction;
