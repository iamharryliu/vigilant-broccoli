import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { logger } from '@vigilant-broccoli/common-node';
import { INVALID_PATH_MESSAGE } from './error.consts';

export const invalidPathHandler = (
  _request: Request,
  _response: Response,
  next: NextFunction,
) => {
  const err = new Error(INVALID_PATH_MESSAGE);
  (err as any).statusCode = HTTP_STATUS_CODES.INVALID_PATH;
  next(err);
};

export const errorLogger = (
  error: any,
  _request: Request,
  _response: Response,
  next: NextFunction,
) => {
  logger.error(error.message);
  next(error);
};

export const errorResponder = (
  error: any,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  response.status(error.statusCode).json({ error: error.message });
};
