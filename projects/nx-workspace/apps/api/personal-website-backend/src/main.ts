import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { logger } from '@prettydamntired/test-node-tools';
import { CORS_OPTIONS, PORT, HOST } from './configs/app.const';
import { requestLogger } from './middlewares/common.middleware';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
} from './middlewares/error.middleware';
import { router } from './routes';

const app = express();
app.use(cors(CORS_OPTIONS));
app.use(requestLogger);
app.use(router);
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
