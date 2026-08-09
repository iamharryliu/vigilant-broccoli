import { timingSafeEqual } from 'crypto';
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  API_KEY_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';

const ERROR_UNAUTHORIZED = 'Unauthorized';

type ApiKeyVerifier = (key: string) => Promise<boolean>;

const isTimingSafeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

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
      } else if (
        typeof providedKey === 'string' &&
        isTimingSafeEqual(providedKey, apiKey)
      ) {
        return;
      }
      reply
        .code(HTTP_STATUS_CODES.UNAUTHORIZED)
        .send({ error: ERROR_UNAUTHORIZED });
    });
  };
  return fp(plugin);
};
