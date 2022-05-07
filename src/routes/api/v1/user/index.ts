import { Router } from 'express';
import remove from './remove';

const user = Router();

user.use('/remove', remove);

export default user;
