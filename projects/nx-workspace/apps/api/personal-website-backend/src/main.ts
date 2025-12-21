import express from 'express';
import cors from 'cors';
import { CORS_OPTIONS, PORT, HOST } from './configs/app.const';
import { router } from './routes';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
  requestLogger,
} from '@vigilant-broccoli/express';
import { logger } from '@vigilant-broccoli/common-node';

const app = express();

// Routes
app.use(cors(CORS_OPTIONS));
app.use(requestLogger);
app.use(router);

// Error Middleware
app.use(invalidPathHandler);
app.use(errorLogger);
app.use(errorResponder);

export const server = app.listen(PORT as number, HOST, () => {
  logger.info(`Server listening at ${HOST}:${PORT}`);
});

export default app;
