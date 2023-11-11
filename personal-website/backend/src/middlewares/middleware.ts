import { RecapchaService } from '../services/RecaptchaService';
import { logger } from './loggers';

export const requestLogger = (request, response, next) => {
  logger.info('Request Logged');
  next();
};

export const requireJsonContent = (request, response, next) => {
  if (request.headers['content-type'] !== 'application/json') {
    response.status(400).send('Server requires application/json');
  } else {
    next();
    return;
  }
};

export const checkRecaptchaToken = async (request, response, next) => {
  const { token } = request.body;
  const isTrusted = await RecapchaService.isTrustedRequest(token);
  if (isTrusted) {
    next();
  } else {
    logger.error(`Request from potential bot.`);
    response.status(403).send('Forbidden');
  }
};
