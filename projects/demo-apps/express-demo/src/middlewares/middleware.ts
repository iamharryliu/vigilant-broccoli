import { HTTP_STATUS_CODES } from '@prettydamntired/todo-lib';

export const requestLogger = (request, response, next) => {
  console.log('Request Logged');
  next();
};

export const requireJsonContent = (request, response, next) => {
  if (request.headers['content-type'] !== 'application/json') {
    response
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .send('Server requires application/json');
  } else {
    next();
  }
};
