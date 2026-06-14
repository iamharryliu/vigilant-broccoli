import Fastify from 'fastify';
import cors from '@fastify/cors';
import llmRoutes from './routes/llm';
import chatRoutes from './routes/chat';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  createApiKeyPlugin,
  createCorsOptions,
  createDocsPlugin,
  DOCS_PATH,
  pingPlugin,
  requestLoggerPlugin,
} from '@vigilant-broccoli/fastify';
import { swaggerSpec } from './libs/swagger';

const SERVICE_NAME = 'llm-service';
const BODY_LIMIT_BYTES = 10 * 1024 * 1024;

const APP_PORT = Number(getEnvironmentVariable('PORT') || 3333);
const APP_HOST = getEnvironmentVariable('HOST') || '127.0.0.1';
const API_KEY = getEnvironmentVariable('SHARED_APP_TOKEN');

const ALLOWED_ORIGINS: string[] = [];

const buildApp = async () => {
  const app = Fastify({ bodyLimit: BODY_LIMIT_BYTES, logger: false });

  await app.register(cors, createCorsOptions(ALLOWED_ORIGINS));
  await app.register(requestLoggerPlugin);
  await app.register(createDocsPlugin(swaggerSpec, SERVICE_NAME));

  app.get('/', async () => ({ service: SERVICE_NAME, docs: DOCS_PATH }));

  await app.register(
    async api => {
      await api.register(createApiKeyPlugin(API_KEY));
      await api.register(pingPlugin);
      await api.register(llmRoutes, { prefix: '/llm' });
      await api.register(chatRoutes, { prefix: '/chat' });
    },
    { prefix: '/api' },
  );

  return app;
};

const start = async () => {
  const app = await buildApp();
  await app.listen({ port: APP_PORT, host: APP_HOST });
  console.log('');
  console.log(`Server running at http://${APP_HOST}:${APP_PORT}`);
  console.log('Ctrl-c to stop');
  console.log('');
};

start();
