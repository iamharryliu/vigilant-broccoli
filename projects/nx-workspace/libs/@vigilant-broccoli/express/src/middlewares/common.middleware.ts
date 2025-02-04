import { Request, Response, NextFunction } from 'express';
import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { logger, RecaptchaService } from '@vigilant-broccoli/common-node';

export const requestLogger = (
  _request: Request,
  _response: Response,
  next: NextFunction,
) => {
  logger.info('Request Logged');
  next();
};

export const requireJsonContent = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (request.headers['content-type'] !== 'application/json') {
    response
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ message: 'Server requires application/json' });
  } else {
    next();
  }
};

export const checkRecaptchaToken = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (request.method !== HTTP_METHOD.GET) {
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
