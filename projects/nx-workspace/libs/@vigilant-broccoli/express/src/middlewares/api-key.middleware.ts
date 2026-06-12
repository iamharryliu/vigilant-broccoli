import { Request, Response, NextFunction } from 'express';
import {
  API_KEY_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const ERROR_UNAUTHORIZED = 'Unauthorized';

export const createApiKeyMiddleware = (apiKey?: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const providedKey = req.headers[API_KEY_HEADER];
    if (!apiKey || providedKey === apiKey) {
      return next();
    }
    res
      .status(HTTP_STATUS_CODES.UNAUTHORIZED)
      .json({ error: ERROR_UNAUTHORIZED });
  };
};
