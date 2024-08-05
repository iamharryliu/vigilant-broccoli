import express from 'express';
import cors from 'cors';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
} from './src/middlewares/errormiddleware';
import { requestLogger } from './src/middlewares/middleware';
import { router } from './src/routes/router';
import { CORS_OPTIONS, PORT } from './src/configs/app.const';
import { todoRouter } from './src/routes/todoRouter';


const app = express();
app.use(cors());
app.options('*', cors(CORS_OPTIONS));
app.use(router);
app.use('/todo', todoRouter)
app.use(requestLogger);
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
