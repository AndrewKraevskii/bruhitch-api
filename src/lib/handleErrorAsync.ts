import { NextFunction, Request, RequestHandler, Response } from 'express';

const handleErrorAsync =
  (func: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default handleErrorAsync;
