import { FastifyPluginAsync } from 'fastify';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { listPublicEventCalendars } from '../libs/event-calendars.db';

const CACHE_CONTROL_HEADER = 'Cache-Control';
const NO_STORE = 'no-store';
const ERROR_UNAVAILABLE = 'Event calendars are temporarily unavailable';

const publicEventCalendarsRoutes: FastifyPluginAsync = async app => {
  app.get('/', async (_req, reply) => {
    reply.header(CACHE_CONTROL_HEADER, NO_STORE);
    try {
      return { calendars: await listPublicEventCalendars() };
    } catch (error) {
      console.error('Failed to load public event calendars:', error);
      return reply
        .code(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send({ error: ERROR_UNAVAILABLE });
    }
  });
};

export default publicEventCalendarsRoutes;
