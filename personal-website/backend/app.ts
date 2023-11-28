import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
} from './src/middlewares/error.middleware';
import { requestLogger } from './src/middlewares/common.middleware';
import { router } from './src/routes/router';
import { router as messageRouter } from './src/routes/message-router';
import { router as VibeCheckLiteRouter } from './src/routes/vibecheck-lite-router';
import { PORT, CORS_OPTIONS, HOST } from './src/configs/app.const';
import { logger } from './src/middlewares/loggers';
import {
  MONGO_DB_SERVER,
  MONGO_DB_SETTINGS,
} from '@prettydamntired/node-tools';

const app = express();
app.use(cors(CORS_OPTIONS));
app.use(requestLogger);
app.use(router);
app.use(messageRouter);
app.use(VibeCheckLiteRouter);
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);

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
