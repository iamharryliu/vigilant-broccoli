import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = randomUUID();
  const start = Date.now();

  res.on('finish', () => {
    const log = {
      timestamp: new Date().toISOString(),
      level:
        res.statusCode >= 500
          ? 'error'
          : res.statusCode >= 400
            ? 'warn'
            : 'info',
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latency_ms: Date.now() - start,
    };
    console.log(JSON.stringify(log));
  });

  next();
};
