import { FastifyPluginAsync } from 'fastify';
import { HTTP_METHOD, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { logger, RecaptchaService } from '@vigilant-broccoli/common-node';

export const recaptchaPlugin: FastifyPluginAsync = async app => {
  app.addHook('preHandler', async (req, reply) => {
    if (req.method === HTTP_METHOD.GET) return;
    const { recaptchaToken } = (req.body || {}) as any;
    const service = new RecaptchaService();
    if (await service.isTrustedRequest(recaptchaToken)) {
      logger.info(`Successful request from origin: ${req.headers.origin}`);
      return;
    }
    logger.error(
      `Unsuccessful request from origin: ${req.headers.origin}. Potential bot detected.`,
    );
    reply.code(HTTP_STATUS_CODES.FORBIDDEN).send();
  });
};
