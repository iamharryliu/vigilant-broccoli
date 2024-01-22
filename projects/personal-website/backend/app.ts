import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
} from './src/middlewares/error.middleware';
import { requestLogger } from './src/middlewares/common.middleware';
import { router as contactRouter } from './src/routes/contact.router';
import { router as subscribeRouter } from './src/routes/subscribe.router';
import { PORT, CORS_OPTIONS, HOST } from './src/configs/app.const';
import { logger } from '@prettydamntired/node-tools';
import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';

const app = express();
app.use(cors(CORS_OPTIONS));
app.use(requestLogger);
app.get('/', (_, res) => res.status(HTTP_STATUS_CODES.OK).send());
app.use('/contact', contactRouter);
app.use('/subscribe', subscribeRouter);
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);

export const server = app.listen(PORT as number, HOST, () => {
  logger.info(`Server listening at ${HOST}:${PORT}`);
});

const MONGO_DB_SERVER = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net`;
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
