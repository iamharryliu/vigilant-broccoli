import { logger } from '@prettydamntired/node-tools';
import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';

export const errorLogger = (error, request, response, next) => {
  logger.error(`${error.message}`);
  next(error);
};

export const errorResponder = (error, request, response, _) => {
  response.header('Content-Type', 'application/json');
  response.status(error.statusCode).json({ error: error.message });
};

export const invalidPathHandler = (request, response, _) => {
  response.status(HTTP_STATUS_CODES.INVALID_PATH);
  response.json({ error: 'invalid path' });
};
