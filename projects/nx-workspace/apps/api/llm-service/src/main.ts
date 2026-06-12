import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import llmRouter from './routes/llm';
import chatRouter from './routes/chat';
import {
  getEnvironmentVariable,
  requestLoggerMiddleware,
} from '@vigilant-broccoli/common-node';
import { createApiKeyMiddleware } from './libs/middlewares/api-key.middleware';
import {
  createCorsOptions,
  DOCS_PATH,
  swaggerUiCdnOptions,
} from '@vigilant-broccoli/express';
import { swaggerSpec } from './libs/swagger';

const SERVICE_NAME = 'llm-service';

const APP_PORT = getEnvironmentVariable('PORT') || 3333;
const APP_HOST = getEnvironmentVariable('HOST') || '127.0.0.1';
const API_KEY = getEnvironmentVariable('SHARED_APP_TOKEN');

const ALLOWED_ORIGINS: string[] = [];

const createApp = () => {
  const app = express();
  app.use(cors(createCorsOptions(ALLOWED_ORIGINS)));
  app.use(express.json({ limit: '10mb' }));
  app.use(requestLoggerMiddleware);
  app.get('/', (_, response) => {
    response.json({ service: SERVICE_NAME, docs: DOCS_PATH });
  });
  app.use(
    DOCS_PATH,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiCdnOptions),
  );
  app.use(createApiKeyMiddleware(API_KEY));
  app.use('/api/llm', llmRouter);
  app.use('/api/chat', chatRouter);
  return app;
};

const app = createApp();

app.listen(APP_PORT as number, APP_HOST, () => {
  console.log('');
  console.log(`Server running at http://${APP_HOST}:${APP_PORT}`);
  console.log('Ctrl-c to stop');
  console.log('');
});

export { app };
