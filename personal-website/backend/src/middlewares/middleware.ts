import { HTTP_STATUS_CODES, IS_DEV_ENV } from '../configs/app.const';
import { RecapchaService } from '../services/RecaptchaService';
import { logger } from './loggers';

export const requestLogger = (request, response, next) => {
  logger.info('Request Logged');
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

export const checkRecaptchaToken = async (request, response, next) => {
  const { token } = request.body;
  const isTrusted =
    (await RecapchaService.isTrustedRequest(token)) || IS_DEV_ENV;
  if (isTrusted) {
    next();
  } else {
    logger.error(`Request from potential bot.`);
    response.status(HTTP_STATUS_CODES.FORBIDDEN).send('Forbidden');
  }
};
