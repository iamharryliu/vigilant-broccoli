import Fastify, {
  FastifyError,
  FastifyInstance,
  FastifyPluginAsync,
} from 'fastify';
import fastifyStatic from '@fastify/static';
import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createDocsPlugin } from '@vigilant-broccoli/fastify';
import { API_PREFIX, isApiUrl, supabaseAuthHook } from './libs/auth.hook';
import { swaggerSpec } from './libs/swagger';
import apiRoutes from './routes';

export const SERVICE_NAME = 'vb-manager-local-fastify';
const BODY_LIMIT_BYTES = 100 * 1024 * 1024;
const SPA_INDEX = 'index.html';
const ANY_CONTENT_TYPE = '*';
const FASTIFY_ERROR_CODE_PREFIX = 'FST_';

type BuildAppOptions = { staticDir?: string };

// Next.js route handlers read raw bodies themselves (json, formData, text),
// so every content type is handed through as an untouched Buffer.
const apiPlugin: FastifyPluginAsync = async api => {
  api.removeAllContentTypeParsers();
  api.addContentTypeParser(
    ANY_CONTENT_TYPE,
    { parseAs: 'buffer' },
    (_request, body, done) => done(null, body),
  );
  api.setErrorHandler((error: FastifyError, _request, reply) => {
    console.error(error);
    const isFrameworkError = error.code?.startsWith(FASTIFY_ERROR_CODE_PREFIX);
    reply
      .code(
        isFrameworkError && error.statusCode
          ? error.statusCode
          : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      )
      .send();
  });
  await api.register(apiRoutes);
};

export const buildApp = async ({
  staticDir,
}: BuildAppOptions = {}): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    bodyLimit: BODY_LIMIT_BYTES,
  });

  app.addHook('onRequest', supabaseAuthHook);

  await app.register(createDocsPlugin(swaggerSpec, SERVICE_NAME));
  await app.register(apiPlugin, { prefix: API_PREFIX });

  if (staticDir) {
    await app.register(fastifyStatic, { root: staticDir });
    app.setNotFoundHandler((request, reply) => {
      if (request.method !== HTTP_METHOD.GET || isApiUrl(request.url)) {
        return reply.code(HTTP_STATUS_CODES.INVALID_PATH).send();
      }
      return reply.sendFile(SPA_INDEX);
    });
  }

  return app;
};
