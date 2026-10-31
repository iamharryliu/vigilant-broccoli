import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import mediaRoutes from './routes/media';
import { MAX_UPLOAD_BYTES, MediaValidationError } from './libs/media';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  createApiKeyPlugin,
  createCorsOptions,
  createDocsPlugin,
  createRateLimitPlugin,
  DOCS_PATH,
  pingPlugin,
  requestLoggerPlugin,
} from '@vigilant-broccoli/fastify';
import { swaggerSpec } from './libs/swagger';

const SERVICE_NAME = 'media-service';
const API_PREFIX = '/api';

const APP_PORT = Number(getEnvironmentVariable('PORT') || 3001);
const APP_HOST = getEnvironmentVariable('HOST') || '127.0.0.1';
const API_KEY = getEnvironmentVariable('SHARED_APP_TOKEN');

const ALLOWED_ORIGINS: string[] = [];

const buildApp = async () => {
  const app = Fastify({ logger: false });

  app.setErrorHandler((error, _req, reply) =>
    error instanceof MediaValidationError
      ? reply.code(HTTP_STATUS_CODES.BAD_REQUEST).send({ error: error.message })
      : reply.send(error),
  );

  await app.register(cors, createCorsOptions(ALLOWED_ORIGINS));
  await app.register(createRateLimitPlugin());
  await app.register(multipart, {
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  });
  await app.register(requestLoggerPlugin);
  await app.register(createDocsPlugin(swaggerSpec, SERVICE_NAME));

  app.get('/', async () => ({ service: SERVICE_NAME, docs: DOCS_PATH }));

  await app.register(async api => {
    await api.register(createApiKeyPlugin(API_KEY));
    await api.register(pingPlugin, { prefix: API_PREFIX });
    await api.register(mediaRoutes);
  });

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
