import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as eventsRoute from './events.route';
import * as parseRoute from './parse.route';

const calendarRoutes: FastifyPluginAsync = async app => {
  app.get('/events', webHandler(eventsRoute.GET));
  app.post('/events', webHandler(eventsRoute.POST));
  app.post('/parse', webHandler(parseRoute.POST));
};

export default calendarRoutes;
