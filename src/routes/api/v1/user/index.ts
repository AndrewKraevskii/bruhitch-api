import { Router } from 'express';
import remove from './remove';
import twitch from './twitch';

const index = Router();

index.use('/remove', remove);
index.use('/twitch', twitch);

export default index;
