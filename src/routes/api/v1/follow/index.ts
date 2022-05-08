import callback from '$routes/api/v1/follow/callback';
import settings from '$routes/api/v1/follow/settings';
import { Router } from 'express';

const follow = Router();

follow.use('/settings', settings);
follow.use('/callback', callback);

export default follow;
