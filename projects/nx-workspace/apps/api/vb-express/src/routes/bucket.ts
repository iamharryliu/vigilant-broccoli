import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  getUploadUrl,
  getDownloadUrl,
  deleteFile,
} from '../libs/storage-service.client';

const toParams = (req: FastifyRequest) =>
  new URLSearchParams(req.query as Record<string, string>);

const bucketRoutes: FastifyPluginAsync = async app => {
  app.get('/upload-url', async (req, reply) => {
    try {
      return reply.send({ url: await getUploadUrl(toParams(req)) });
    } catch (e) {
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: (e as Error).message });
    }
  });

  app.get('/download-url', async (req, reply) => {
    try {
      return reply.send({ url: await getDownloadUrl(toParams(req)) });
    } catch (e) {
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: (e as Error).message });
    }
  });

  app.delete('/file', async (req, reply) => {
    try {
      await deleteFile(toParams(req));
      return reply.send({ success: true });
    } catch (e) {
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: (e as Error).message });
    }
  });
};

export default bucketRoutes;
