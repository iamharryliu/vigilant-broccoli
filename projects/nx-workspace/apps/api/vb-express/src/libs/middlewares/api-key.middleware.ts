import express from 'express';

export const createApiKeyMiddleware = (apiKey?: string) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const providedKey = req.headers['x-api-key'];
    if (!apiKey || providedKey === apiKey) {
      return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
  };
};
