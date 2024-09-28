import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODES } from '@prettydamntired/common-lib';
import {
  GENERAL_ERROR_CODE,
  ResponseError,
} from '@prettydamntired/personal-website-lib';
import { logger } from '@prettydamntired/test-node-tools';

export const invalidPathHandler = (
  _request: Request,
  _response: Response,
  next: NextFunction,
) => {
  const err = new Error(GENERAL_ERROR_CODE.INVALID_PATH) as ResponseError;
  err.statusCode = HTTP_STATUS_CODES.INVALID_PATH;
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
