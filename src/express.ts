import { hashSHA256 } from '$lib/sha256';
import errorMiddleware from '$middlewares/errorMiddleware';
import apiV1 from '$routes/api/v1';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import session from 'express-session';
import { v4 } from 'uuid';

export const createExpressServer = (): Express => {
  const app = express();

  //#region Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    session({
      genid: (req) => v4(),
      secret: hashSHA256(v4()),
      cookie: {
        maxAge: 1000 * 60 * 5,
        path: '/',
        secure: false,
        httpOnly: true
      },
      resave: true,
      saveUninitialized: true
    })
  );
  //#endregion

  //#region Routing
  app.use('/api/v1', apiV1);
  //#endregion

  app.use(errorMiddleware);

  return app;
};

export default createExpressServer;
