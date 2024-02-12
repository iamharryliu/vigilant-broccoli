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
import { CORS_OPTIONS, PORT, HOST } from './configs/app.const';
import { router } from './routes';
import { MONGO_DB_SERVER } from '@prettydamntired/personal-website-api-lib';

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

mongoose.connect(MONGO_DB_SERVER, { dbName: process.env.PERSONAL_WEBSITE_DB });
export const db = mongoose.connection;
db.once('open', () => {
  logger.info('Connected to MongoDB');
});
db.on('error', error => {
  logger.error(`MongoDB connection error: ${error}`);
});

export default app;
