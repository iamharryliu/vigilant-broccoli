import express from 'express';
import { API_KEY_HEADER } from '@vigilant-broccoli/common-js';

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
    res.status(401).json({ error: 'Unauthorized' });
  };
};
