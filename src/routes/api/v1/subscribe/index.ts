import { Router } from 'express';
import settings from './settings';

const subscribe = Router();

subscribe.use('/settings', settings);

export default subscribe;
