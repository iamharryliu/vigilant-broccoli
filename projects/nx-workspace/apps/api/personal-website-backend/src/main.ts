import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
  logger,
  requestLogger,
} from '@prettydamntired/test-node-tools';
import { CORS_OPTIONS, PORT, HOST, IS_DEV_ENV } from './configs/app.const';
import { router } from './routes';
import {
  MONGO_DB_SERVER,
  PERSONAL_WEBSITE_DB_NAME,
} from '@prettydamntired/personal-website-api-lib';

const app = express();

// Routes
if (!IS_DEV_ENV) {
  app.use(cors(CORS_OPTIONS));
}
app.use(requestLogger);
app.use(router);

// Error Middleware
app.use(invalidPathHandler);
app.use(errorLogger);
app.use(errorResponder);

export const server = app.listen(PORT as number, HOST, () => {
  logger.info(`Server listening at ${HOST}:${PORT}`);
});

mongoose.connect(MONGO_DB_SERVER, {
  dbName: IS_DEV_ENV
    ? PERSONAL_WEBSITE_DB_NAME.DEV
    : PERSONAL_WEBSITE_DB_NAME.PROD,
});
export const db = mongoose.connection;
db.once('open', () => {
  logger.info('Connected to MongoDB');
});
db.on('error', error => {
  logger.error(`MongoDB connection error: ${error}`);
});

export default app;
