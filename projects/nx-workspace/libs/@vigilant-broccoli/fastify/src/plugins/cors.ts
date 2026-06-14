import { FastifyCorsOptions } from '@fastify/cors';

export const createCorsOptions = (
  allowedOrigins: string[],
): FastifyCorsOptions => ({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    }
  },
  credentials: true,
});
