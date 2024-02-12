import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';
import { logger } from '../../services/logging/logger.service';

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

export const invalidPathHandler = (request: any, response: any) => {
  response.status(HTTP_STATUS_CODES.INVALID_PATH).send();
};
