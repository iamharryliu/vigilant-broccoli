import express from 'express';
import cors from 'cors';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
} from './middlewares/errormiddleware';
import { requestLogger } from './middlewares/middleware';
import { router } from './routes/router';
import { CORS_OPTIONS, PORT } from './const';
import { todoRouter } from './routes/todoRouter';

const app = express();
app.use(cors());
app.options('*', cors(CORS_OPTIONS));
app.use(router);
app.use('/todos', todoRouter);
app.use(requestLogger);
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
