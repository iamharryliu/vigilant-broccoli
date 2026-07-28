import Fastify, { FastifyInstance, FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { auth, createServiceVerifier, verifyApiKey } from './auth';
import { getMigrations } from 'better-auth/db/migration';
import { syncLegacySharedApiKey } from './libs/api-key-seed';
import authRoutes from './routes/auth';
import apiKeysRoutes from './routes/api-keys';
import tasksRoutes from './routes/tasks';
import tasksParseRoutes from './routes/tasks-parse';
import llmRoutes from './routes/llm';
import chatRoutes from './routes/chat';
import calendarRoutes from './routes/calendar';
import { contactRoutes, messagingRoutes } from './routes/messaging';
import voiceListRoutes from './routes/voice-list';
import speechToTextRoutes from './routes/speech-to-text';
import textToSpeechRoutes from './routes/text-to-speech';
import whereIsRoutes from './routes/where-is';
import priceTrackerRoutes from './routes/price-tracker';
import recipeRoutes from './routes/recipe';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { VB_EXPRESS_SERVICE } from '@vigilant-broccoli/common-js';
import {
  createApiKeyPlugin,
  createCorsOptions,
  createDocsPlugin,
  pingPlugin,
  recaptchaPlugin,
  requestLoggerPlugin,
} from '@vigilant-broccoli/fastify';
import { swaggerSpec } from './libs/swagger';

const SERVICE_NAME = 'vb-express';
const BODY_LIMIT_BYTES = 10 * 1024 * 1024;

const APP_PORT = Number(getEnvironmentVariable('PORT') || 3333);
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

const registerService = (
  app: FastifyInstance,
  prefix: string,
  service: string,
  routes: FastifyPluginAsync[],
) =>
  app.register(
    async scope => {
      await scope.register(
        createApiKeyPlugin(API_KEY, createServiceVerifier([service])),
      );
      for (const route of routes) {
        await scope.register(route);
      }
    },
    { prefix },
  );

const buildApp = async () => {
  const app = Fastify({ bodyLimit: BODY_LIMIT_BYTES, logger: false });
  await app.register(cors, createCorsOptions(ALLOWED_ORIGINS));
  await app.register(multipart);
  await app.register(requestLoggerPlugin);
  await app.register(createDocsPlugin(swaggerSpec, SERVICE_NAME));
  app.get('/', async () => SERVICE_NAME);
  await app.register(authRoutes);
  await app.register(
    async scope => {
      await scope.register(recaptchaPlugin);
      await scope.register(contactRoutes);
    },
    { prefix: '/contact' },
  );
  await app.register(
    async scope => {
      await scope.register(createApiKeyPlugin(API_KEY));
      await scope.register(apiKeysRoutes);
    },
    { prefix: '/api/admin/api-keys' },
  );
  await registerService(app, '/api/messaging', VB_EXPRESS_SERVICE.MESSAGING, [
    messagingRoutes,
  ]);
  await registerService(app, '/api/tasks', VB_EXPRESS_SERVICE.TASKS, [
    tasksRoutes,
    tasksParseRoutes,
  ]);
  await registerService(app, '/api/llm', VB_EXPRESS_SERVICE.LLM, [llmRoutes]);
  await registerService(app, '/api/chat', VB_EXPRESS_SERVICE.CHAT, [
    chatRoutes,
  ]);
  await registerService(app, '/api/calendar', VB_EXPRESS_SERVICE.CALENDAR, [
    calendarRoutes,
  ]);
  await registerService(app, '/api/voice-list', VB_EXPRESS_SERVICE.VOICE_LIST, [
    voiceListRoutes,
  ]);
  await registerService(
    app,
    '/api/speech-to-text',
    VB_EXPRESS_SERVICE.SPEECH_TO_TEXT,
    [speechToTextRoutes],
  );
  await registerService(
    app,
    '/api/text-to-speech',
    VB_EXPRESS_SERVICE.TEXT_TO_SPEECH,
    [textToSpeechRoutes],
  );
  await registerService(app, '/api/where-is', VB_EXPRESS_SERVICE.WHERE_IS, [
    whereIsRoutes,
  ]);
  await registerService(
    app,
    '/api/price-tracker',
    VB_EXPRESS_SERVICE.PRICE_TRACKER,
    [priceTrackerRoutes],
  );
  await registerService(app, '/api/recipe', VB_EXPRESS_SERVICE.RECIPE, [
    recipeRoutes,
  ]);
  await app.register(
    async scope => {
      await scope.register(createApiKeyPlugin(API_KEY, verifyApiKey));
      await scope.register(pingPlugin);
    },
    { prefix: '/api' },
  );
  return app;
};

const startServer = async () => {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  await syncLegacySharedApiKey();
  const app = await buildApp();
  await app.listen({ port: APP_PORT, host: APP_HOST });
  console.log('');
  console.log(`Server running at http://${APP_HOST}:${APP_PORT}`);
  console.log('Ctrl-c to stop');
  console.log('');
};

startServer();
