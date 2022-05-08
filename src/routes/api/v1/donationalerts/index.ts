import callback from '$routes/api/v1/donationalerts/callback';
import login from '$routes/api/v1/donationalerts/login';
import token from '$routes/api/v1/donationalerts/token';
import { Router } from 'express';

const donationAlerts = Router();

donationAlerts.use('/login', login);
donationAlerts.use('/callback', callback);
donationAlerts.use('/token', token);

export default donationAlerts;
