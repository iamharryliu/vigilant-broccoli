import { FastifyPluginAsync } from 'fastify';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { callLlm } from '../libs/llm-service.client';

const ERROR_LLM_SERVICE = 'llm-service error';

const llmRoutes: FastifyPluginAsync = async app => {
  app.post('/', async (req, reply) => {
    try {
      return await callLlm<{ outputs: unknown[] }>(req.body);
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_LLM_SERVICE;
      return reply.code(HTTP_STATUS_CODES.BAD_GATEWAY).send({ error: message });
    }
  });
};

export default llmRoutes;
