import ApiError from '$exceptions/apiError';
import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ status: err.status, message: err.message });
  }

  const id = v4();

  err.name = `${err.name} ${id}`;

  console.error(err);
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ status: StatusCodes.INTERNAL_SERVER_ERROR, message: `Unexpected error: ${id}` });
};

export default errorMiddleware;
