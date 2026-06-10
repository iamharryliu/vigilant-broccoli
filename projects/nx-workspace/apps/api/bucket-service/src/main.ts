import express from 'express';
import cors from 'cors';
import bucketRouter from './routes/bucket';
import {
  getEnvironmentVariable,
  requestLoggerMiddleware,
} from '@vigilant-broccoli/common-node';
import { createApiKeyMiddleware } from './libs/middlewares/api-key.middleware';
import { createCorsOptions } from '@vigilant-broccoli/express';

const APP_PORT = getEnvironmentVariable('PORT') || 3000;
const APP_HOST = getEnvironmentVariable('HOST') || '127.0.0.1';
const API_KEY = getEnvironmentVariable('SHARED_APP_TOKEN');

const ALLOWED_ORIGINS = [
  'http://localhost:1337',
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:5173',
  'http://127.0.0.1:1337',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4200',
  'http://127.0.0.1:5173',
  'https://harryliu.dev',
  'https://www.harryliu.dev',
  'https://cloud8skate.com',
  'https://www.cloud8skate.com',
];

const createApp = () => {
  const app = express();
  app.use(cors(createCorsOptions(ALLOWED_ORIGINS)));
  app.use(express.json({ limit: '10mb' }));
  app.use(requestLoggerMiddleware);
  app.get('/', (_, response) => {
    response.send('vb-storage-service');
  });
  app.use(createApiKeyMiddleware(API_KEY));
  app.use('/api/bucket', bucketRouter);
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
