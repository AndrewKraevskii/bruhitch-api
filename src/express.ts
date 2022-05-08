import errorMiddleware from '$middlewares/errorMiddleware';
import apiV1 from '$routes/api/v1';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';

export const createExpressServer = (): Express => {
  const app = express();

  //#region Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  //#endregion

  //#region Routing
  app.use('/api/v1', apiV1);
  //#endregion

  app.use(errorMiddleware);

  return app;
};

export default createExpressServer;
