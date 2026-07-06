import { Request, Response, NextFunction } from 'express';
import {
  API_KEY_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const ERROR_UNAUTHORIZED = 'Unauthorized';

type ApiKeyVerifier = (key: string) => Promise<boolean>;

export const createApiKeyMiddleware = (
  apiKey?: string,
  verifyApiKey?: ApiKeyVerifier,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const providedKey = req.headers[API_KEY_HEADER];
    if (!apiKey) {
      return next();
    }
    if (verifyApiKey) {
      if (
        typeof providedKey === 'string' &&
        (await verifyApiKey(providedKey))
      ) {
        return next();
      }
    } else if (providedKey === apiKey) {
      return next();
    }
    res
      .status(HTTP_STATUS_CODES.UNAUTHORIZED)
      .json({ error: ERROR_UNAUTHORIZED });
  };
};
