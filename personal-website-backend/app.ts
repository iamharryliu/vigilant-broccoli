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
import { PORT, CORS_OPTIONS } from './app.const';
import { ConnectOptions } from 'mongoose';

const app = express();
app.options('*', cors(CORS_OPTIONS));
app.use(router);
app.use(requestLogger);
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

mongoose.connect(
  'mongodb+srv://harryliu:password1!@cluster0.txzecw2.mongodb.net/',
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
