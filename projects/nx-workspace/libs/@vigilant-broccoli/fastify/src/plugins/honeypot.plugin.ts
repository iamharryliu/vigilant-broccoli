import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import {
  HONEYPOT_FIELD_NAME,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  isHoneypotTriggered,
} from '@vigilant-broccoli/common-js';
import { logger } from '@vigilant-broccoli/common-node';

const plugin: FastifyPluginAsync = async app => {
  app.addHook('preHandler', async (req, reply) => {
    if (req.method === HTTP_METHOD.GET) return;
    const body = (req.body || {}) as Record<string, unknown>;
    if (!isHoneypotTriggered(body[HONEYPOT_FIELD_NAME] as string)) return;
    logger.error(
      `Honeypot field filled by request from origin: ${req.headers.origin}. Potential bot detected.`,
    );
    reply.code(HTTP_STATUS_CODES.FORBIDDEN).send();
  });
};

export const honeypotPlugin = fp(plugin);
