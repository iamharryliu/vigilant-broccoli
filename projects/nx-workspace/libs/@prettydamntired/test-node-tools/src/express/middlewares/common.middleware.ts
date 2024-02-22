import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';
import { RecaptchaService } from '../../services/recaptcha/recaptcha.service';
import { logger } from '../../services/logging/logger.service';

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
    const recaptchaService = new RecaptchaService();
    if (await recaptchaService.isTrustedRequest(recaptchaToken)) {
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
