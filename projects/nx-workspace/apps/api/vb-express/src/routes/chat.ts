import { FastifyPluginAsync } from 'fastify';
import { Readable } from 'stream';
import {
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { streamChat } from '../libs/llm-service.client';

const ERROR_STREAM_FAILED = 'Failed to stream response';
const STREAM_HEADERS: Record<string, string> = {
  [CONTENT_TYPE_HEADER]: 'text/plain; charset=utf-8',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
};

const chatRoutes: FastifyPluginAsync = async app => {
  app.post('/', async (req, reply) => {
    try {
      const upstream = await streamChat(req.body);

      if (!upstream.ok || !upstream.body) {
        const text = await upstream.text();
        console.error(ERROR_STREAM_FAILED, text);
        return reply
          .code(upstream.status || HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .send({ error: ERROR_STREAM_FAILED });
      }

      for (const [k, v] of Object.entries(STREAM_HEADERS)) reply.header(k, v);

      return reply.send(
        Readable.fromWeb(
          upstream.body as Parameters<typeof Readable.fromWeb>[0],
        ),
      );
    } catch (err) {
      console.error(ERROR_STREAM_FAILED, err);
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: ERROR_STREAM_FAILED });
    }
  });
};

export default chatRoutes;
