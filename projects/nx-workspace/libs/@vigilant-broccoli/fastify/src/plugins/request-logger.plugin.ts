import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { randomUUID } from 'crypto';

declare module 'fastify' {
  interface FastifyRequest {
    _loggerStart?: number;
    _loggerRequestId?: string;
  }
}

const plugin: FastifyPluginAsync = async app => {
  app.addHook('onRequest', async req => {
    req._loggerRequestId = randomUUID();
    req._loggerStart = Date.now();
  });
  app.addHook('onResponse', async (req, reply) => {
    const log = {
      timestamp: new Date().toISOString(),
      level:
        reply.statusCode >= 500
          ? 'error'
          : reply.statusCode >= 400
            ? 'warn'
            : 'info',
      requestId: req._loggerRequestId,
      method: req.method,
      path: req.url,
      // Route template (`/api/tasks/:id`): dashboards group by it, since
      // `path` carries ids and query strings. Undefined on unmatched (404) URLs.
      route: req.routeOptions.url,
      status: reply.statusCode,
      latency_ms: Date.now() - (req._loggerStart ?? Date.now()),
    };
    console.log(JSON.stringify(log));
  });
};

export const requestLoggerPlugin = fp(plugin);
