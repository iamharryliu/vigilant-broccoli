import express from 'express';
import {
  API_KEY_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const ERROR_UNAUTHORIZED = 'Unauthorized';

export const createApiKeyMiddleware = (apiKey?: string) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const providedKey = req.headers[API_KEY_HEADER];
    if (!apiKey || providedKey === apiKey) {
      return next();
    }
    res
      .status(HTTP_STATUS_CODES.UNAUTHORIZED)
      .json({ error: ERROR_UNAUTHORIZED });
  };
};
