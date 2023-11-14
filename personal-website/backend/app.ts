import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
} from './src/middlewares/errormiddleware';
import { requestLogger } from './src/middlewares/middleware';
import { router } from './src/routes/router';
import { router as messageRouter } from './src/routes/messageRouter';
import { router as VibeCheckLiteRouter } from './src/routes/VibecheckLiteRoute';
import {
  PORT,
  CORS_OPTIONS,
  HOST,
  MONGO_DB_SERVER,
  MONGO_DB_SETTINGS,
} from './src/configs/app.const';
import { logger } from './src/middlewares/loggers';

const app = express();
app.options('*', cors(CORS_OPTIONS));
app.use(router);
app.use(messageRouter);
app.use(VibeCheckLiteRouter);
app.use(errorResponder);
app.use(invalidPathHandler);
app.use(requestLogger);
app.use(errorLogger);
app.listen(PORT as number, HOST, () => {
  logger.info(`Server listening at ${HOST}:${PORT}`);
});

mongoose.connect(MONGO_DB_SERVER, MONGO_DB_SETTINGS);
export const db = mongoose.connection;
db.getClient;
db.on('error', error => {
  console.error(`MongoDB connection error: ${error}`);
});
db.once('open', () => {
  logger.info('Connected to MongoDB');
});
