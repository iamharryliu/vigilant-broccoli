import express from 'express';
import {
  errorLogger,
  errorResponder,
  invalidPathHandler,
} from './errormiddleware';
import { requestLogger } from './middleware';
import { router } from './router';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(router);
app.use(requestLogger);
app.use(errorLogger);
app.use(errorResponder);
app.use(invalidPathHandler);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
