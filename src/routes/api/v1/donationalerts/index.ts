import callback from '$routes/api/v1/donationalerts/callback';
import login from '$routes/api/v1/donationalerts/login';
import settings from '$routes/api/v1/donationalerts/settings';
import sound from '$routes/api/v1/donationalerts/sound';
import subscribe from '$routes/api/v1/donationalerts/subscribe';
import token from '$routes/api/v1/donationalerts/token';
import user from '$routes/api/v1/donationalerts/user';
import { Router } from 'express';

const donationAlerts = Router();

donationAlerts.use('/login', login);
donationAlerts.use('/callback', callback);
donationAlerts.use('/token', token);
donationAlerts.use('/user', user);
donationAlerts.use('/subscribe', subscribe);
donationAlerts.use('/sound', sound);
donationAlerts.use('/settings', settings);

export default donationAlerts;
