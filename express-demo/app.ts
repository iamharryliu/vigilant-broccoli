import express from 'express';
import cors from 'cors';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
} from './errormiddleware';
import { requestLogger } from './middleware';
import { router } from './router';
import { CORS_OPTIONS, PORT } from './app.const';

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
