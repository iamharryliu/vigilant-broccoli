import express from 'express';
import cors from 'cors';
import { auth } from './auth';
import { toNodeHandler } from 'better-auth/node';
import tasksRouter from './routes/tasks';
import tasksParseRouter from './routes/tasks-parse';
import llmRouter from './routes/llm';
import chatRouter from './routes/chat';
import calendarRouter from './routes/calendar';
import { contactRouter, messagingRouter } from './routes/messaging';
import voiceListRouter from './routes/voice-list';
import speechToTextRouter from './routes/speech-to-text';
import textToSpeechRouter from './routes/text-to-speech';
import whereIsRouter from './routes/where-is';
import priceTrackerRouter from './routes/price-tracker';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  createApiKeyMiddleware,
  createCorsOptions,
  pingRouter,
  requestLoggerMiddleware,
} from '@vigilant-broccoli/express';

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
  // ---- Production ----
  'https://harryliu.dev',
  'https://www.harryliu.dev',
  'https://cloud8skate.com',
  'https://www.cloud8skate.com',
];

const createApp = () => {
  const app = express();
  app.use(express.static('public'));
  app.use(cors(createCorsOptions(ALLOWED_ORIGINS)));
  app.use(express.json({ limit: '10mb' }));
  app.use(requestLoggerMiddleware);
  app.get('/', (_, response) => {
    response.send('vb-express');
  });
  app.all('/api/auth/{*path}', toNodeHandler(auth));
  app.use('/contact', contactRouter);
  app.use(createApiKeyMiddleware(API_KEY));
  app.use('/api', pingRouter);
  app.use('/api/messaging', messagingRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/tasks', tasksParseRouter);
  app.use('/api/llm', llmRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/calendar', calendarRouter);
  app.use('/api/voice-list', voiceListRouter);
  app.use('/api/speech-to-text', speechToTextRouter);
  app.use('/api/text-to-speech', textToSpeechRouter);
  app.use('/api/where-is', whereIsRouter);
  app.use('/api/price-tracker', priceTrackerRouter);
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
