import { FastifyPluginAsync } from 'fastify';

export const PING_PATH = '/__ping';

export const pingPlugin: FastifyPluginAsync = async app => {
  app.get(PING_PATH, async () => ({ ok: true }));
};
