import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
} from './errormiddleware';
import { requestLogger } from './middleware';
import { router } from './router';
import { PORT, CORS_OPTIONS, HOST } from './app.const';
import { ConnectOptions } from 'mongoose';

const app = express();
app.options('*', cors(CORS_OPTIONS));
app.use(router);
app.use(requestLogger);
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);
app.listen(PORT as number, HOST, () => {
  console.log(`Server listening at ${HOST}:${PORT}`);
});

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.txzecw2.mongodb.net/`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions,
);
export const db = mongoose.connection;
db.getClient;
db.on('error', error => {
  console.error(`MongoDB connection error: ${error}`);
});
db.once('open', () => {
  console.log('Connected to MongoDB');
});
