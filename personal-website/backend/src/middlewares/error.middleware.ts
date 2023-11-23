import { HTTP_STATUS_CODES } from '../configs/app.const';
import { logger } from './loggers';

export const errorLogger = (err, request, response, next) => {
  logger.error(`Error: ${err.message}`);
  next(err);
};

export const errorResponder = (err, request, response, _) => {
  response.header('Content-Type', 'application/json');
  response.status(err.statusCode).send(err.message);
};

export const invalidPathHandler = (request, response, _) => {
  response.status(HTTP_STATUS_CODES.INVALID_PATH);
  response.send('invalid path');
};
