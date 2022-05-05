import { Router } from 'express';
import callback from './callback';

const prediction = Router();

prediction.use('/callback', callback);

export default prediction;
