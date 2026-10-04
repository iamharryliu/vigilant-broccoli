import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import { PING_PATH } from './ping.plugin';

const DEFAULT_MAX_REQUESTS = 300;
const DEFAULT_TIME_WINDOW = '1 minute';
const ROOT_PATH = '/';
const QUERY_SEPARATOR = '?';

type RateLimitOptions = { max?: number; timeWindow?: string };

// Health endpoints stay unlimited: Upptime polls them on a schedule, so a 429
// there reads as a service outage rather than as throttling. pingPlugin is
// mounted under a prefix per service, so match the suffix rather than a path.
const isHealthCheck = (req: FastifyRequest): boolean => {
  const path = req.url.split(QUERY_SEPARATOR)[0];
  return path === ROOT_PATH || path.endsWith(PING_PATH);
};

export const createRateLimitPlugin = ({
  max = DEFAULT_MAX_REQUESTS,
  timeWindow = DEFAULT_TIME_WINDOW,
}: RateLimitOptions = {}) => {
  const plugin: FastifyPluginAsync = async app => {
    await app.register(rateLimit, {
      max,
      timeWindow,
      allowList: isHealthCheck,
    });
  };
  return fp(plugin);
};
