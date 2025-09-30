import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const error = createError(500, err);
  const status = (error as createError.HttpError).status ?? 500;
  const message = (error as createError.HttpError).message ?? 'Unknown error';
  res.status(status).json({ message, status });
}
