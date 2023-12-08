import {
  HTTP_STATUS_CODES,
  RecapchaService,
  logger,
} from '@prettydamntired/node-tools';
import { IS_DEV_ENV } from '../configs/app.const';

export const requestLogger = (request, response, next) => {
  logger.info('Request Logged');
  next();
};

export const requireJsonContent = (request, response, next) => {
  if (request.headers['content-type'] !== 'application/json') {
    response
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ message: 'Server requires application/json' });
  } else {
    next();
  }
};

export const checkRecaptchaToken = async (request, response, next) => {
  if (request.method !== 'GET') {
    const { recaptchaToken } = request.body;
    const isTrusted =
      IS_DEV_ENV || (await RecapchaService.isTrustedRequest(recaptchaToken));
    if (isTrusted) {
      next();
    } else {
      logger.error(`Request from potential bot.`);
      response
        .status(HTTP_STATUS_CODES.FORBIDDEN)
        .json({ message: 'Forbidden.' });
    }
  } else {
    next();
  }
};
