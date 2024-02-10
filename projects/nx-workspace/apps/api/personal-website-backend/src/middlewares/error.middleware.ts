import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';
import { logger } from '@prettydamntired/test-node-tools';

export const errorLogger = (error, request, response, next) => {
  logger.error(error.message);
  next(error);
};

export const errorResponder = (error, request, response, _) => {
  response.status(error.statusCode).json({ error: error.message });
};

export const invalidPathHandler = (request, response) => {
  response.status(HTTP_STATUS_CODES.INVALID_PATH).send();
};
