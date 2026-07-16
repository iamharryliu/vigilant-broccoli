import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  API_KEY_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const ERROR_UNAUTHORIZED = 'Unauthorized';

type ApiKeyVerifier = (key: string) => Promise<boolean>;

export const createApiKeyPlugin = (
  apiKey?: string,
  verifyApiKey?: ApiKeyVerifier,
) => {
  const plugin: FastifyPluginAsync = async app => {
    app.addHook('onRequest', async (req, reply) => {
      if (!apiKey) {
        reply
          .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .send({ error: ERROR_UNAUTHORIZED });
        return;
      }
      const providedKey = req.headers[API_KEY_HEADER];
      if (verifyApiKey) {
        if (
          typeof providedKey === 'string' &&
          (await verifyApiKey(providedKey))
        ) {
          return;
        }
      } else if (providedKey === apiKey) {
        return;
      }
      reply
        .code(HTTP_STATUS_CODES.UNAUTHORIZED)
        .send({ error: ERROR_UNAUTHORIZED });
    });
  };
  return fp(plugin);
};
