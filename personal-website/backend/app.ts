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
import { router as contactRouter } from './src/routes/contact.router';
import { router as subscribeRouter } from './src/routes/subscribe.router';
import { router as VibeCheckLiteRouter } from './src/routes/vibecheck-lite.router';
import { PORT, CORS_OPTIONS, HOST } from './src/configs/app.const';
import { MONGO_DB_SERVER, logger } from '@prettydamntired/node-tools';

const app = express();
app.use(cors(CORS_OPTIONS));
app.use(requestLogger);
app.use(router);
app.use('/contact', contactRouter);
app.use('/subscribe', subscribeRouter);
app.use('/vibecheck-lite', VibeCheckLiteRouter);
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);

export const server = app.listen(PORT as number, HOST, () => {
  logger.info(`Server listening at ${HOST}:${PORT}`);
});

mongoose.connect(MONGO_DB_SERVER, { dbName: process.env.PERSONAL_WEBSITE_DB });
export const db = mongoose.connection;
db.getClient;
db.on('error', error => {
  console.error(`MongoDB connection error: ${error}`);
});
db.once('open', () => {
  logger.info('Connected to MongoDB');
});

export default app;
