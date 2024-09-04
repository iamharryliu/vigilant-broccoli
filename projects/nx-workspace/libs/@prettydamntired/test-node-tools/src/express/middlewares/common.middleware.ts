import { HTTP_STATUS_CODES } from '@prettydamntired/common-lib';
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
      logger.info(`Successful request from origin: ${request.headers.origin}`);
      next();
    } else {
      logger.error(
        `Unsuccessful request from origin: ${request.headers.origin}. Potential bot detected.`,
      );
      response.status(HTTP_STATUS_CODES.FORBIDDEN).send();
    }
  } else {
    next();
  }
};
