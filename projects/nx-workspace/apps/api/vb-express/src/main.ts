import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';
import tasksRouter from './routes/tasks';
import llmRouter from './routes/llm';
import messagingRouter from './routes/messaging';
import { getEnvironmentVariable, createCorsOptions } from '@vigilant-broccoli/common-node';
import { createApiKeyMiddleware } from './libs/middlewares/api-key.middleware';

const APP_PORT = getEnvironmentVariable('PORT') || 3333;
const APP_HOST = getEnvironmentVariable('HOST') || '127.0.0.1';
const API_KEY = getEnvironmentVariable('VB_EXPRESS_API_KEY');

const ALLOWED_ORIGINS = [
  // ---- Localhost ----
  'http://localhost:1337',
  'http://localhost:3000',
  'http://localhost:4200',
  'http://localhost:5173',
  'http://127.0.0.1:1337',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4200',
  'http://127.0.0.1:5173',
  // 'https://app.example.com',
  // 'https://admin.example.com',
  // 'https://dashboard.example.io',
];

const createApp = () => {
  const app = express();
  app.use(express.static('public'));
  app.use(cors(createCorsOptions(ALLOWED_ORIGINS)));
  app.use(express.json());
  app.get('/', (_, response) => {
    response.send('vb-express');
  });
  app.all('/api/auth/*', toNodeHandler(auth));
  app.use(createApiKeyMiddleware(API_KEY));
  app.use('/api/tasks', tasksRouter);
  app.use('/api/llm', llmRouter);
  app.use('/api', messagingRouter);
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
