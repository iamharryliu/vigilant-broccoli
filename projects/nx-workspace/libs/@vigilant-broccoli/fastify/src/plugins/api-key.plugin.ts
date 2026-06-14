import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  API_KEY_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const ERROR_UNAUTHORIZED = 'Unauthorized';

export const createApiKeyPlugin = (apiKey?: string) => {
  const plugin: FastifyPluginAsync = async app => {
    app.addHook('onRequest', async (req, reply) => {
      const providedKey = req.headers[API_KEY_HEADER];
      if (!apiKey || providedKey === apiKey) return;
      reply
        .code(HTTP_STATUS_CODES.UNAUTHORIZED)
        .send({ error: ERROR_UNAUTHORIZED });
    });
  };
  return fp(plugin);
};
