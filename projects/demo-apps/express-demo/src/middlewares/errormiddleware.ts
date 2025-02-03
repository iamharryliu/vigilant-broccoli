import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export const errorLogger = (error, request, response, next) => {
  console.log(`Error: ${error.message}`);
  next(error);
};

export const errorResponder = (error, request, response, next) => {
  response.header('Content-Type', 'application/json');
  response.status(error.statusCode).json({ error: error.message });
};

export const invalidPathHandler = (request, response, next) => {
  response.status(HTTP_STATUS_CODES.BAD_REQUEST);
  response.send('invalid path');
};
