import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import bucketRoutes from './routes/bucket';
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

const SERVICE_NAME = 'bucket-service';
const BODY_LIMIT_BYTES = 10 * 1024 * 1024;

const APP_PORT = Number(getEnvironmentVariable('PORT') || 3000);
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

const buildApp = async () => {
  const app = Fastify({ bodyLimit: BODY_LIMIT_BYTES, logger: false });

  await app.register(cors, createCorsOptions(ALLOWED_ORIGINS));
  await app.register(multipart);
  await app.register(requestLoggerPlugin);
  await app.register(createDocsPlugin(swaggerSpec, SERVICE_NAME));

  app.get('/', async () => ({ service: SERVICE_NAME, docs: DOCS_PATH }));

  await app.register(
    async api => {
      await api.register(createApiKeyPlugin(API_KEY));
      await api.register(pingPlugin);
      await api.register(bucketRoutes, { prefix: '/bucket' });
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
