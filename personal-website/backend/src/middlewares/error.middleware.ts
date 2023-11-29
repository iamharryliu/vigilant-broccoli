import { HTTP_STATUS_CODES, logger } from '@prettydamntired/node-tools';

export const errorLogger = (error, request, response, next) => {
  logger.error(`Error: ${error.message}`);
  next(error);
};

export const errorResponder = (error, request, response, _) => {
  response.header('Content-Type', 'application/json');
  response.status(error.statusCode).json({ error: error.message });
};

export const invalidPathHandler = (request, response, _) => {
  response.status(HTTP_STATUS_CODES.INVALID_PATH);
  response.json({ message: 'invalid path' });
};
