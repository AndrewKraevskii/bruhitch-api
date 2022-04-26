import { Router } from 'express';
import remove from './remove';

const index = Router();

index.use('/remove', remove);

export default index;
