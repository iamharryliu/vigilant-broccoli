import { HTTP_STATUS_CODES } from '@prettydamntired/common-lib';
import { logger } from '../../services/logging/logger.service';
import {
  GENERAL_ERROR_CODE,
  ResponseError,
} from '@prettydamntired/personal-website-lib';

export const invalidPathHandler = (request: any, response: any, next: any) => {
  const err = new Error(GENERAL_ERROR_CODE.INVALID_PATH) as ResponseError;
  err.statusCode = HTTP_STATUS_CODES.INVALID_PATH;
  next(err);
};

export const errorLogger = (
  error: any,
  request: any,
  response: any,
  next: any,
) => {
  logger.error(error.message);
  next(error);
};

export const errorResponder = (
  error: any,
  request: any,
  response: any,
  _: any,
) => {
  response.status(error.statusCode).json({ error: error.message });
};
