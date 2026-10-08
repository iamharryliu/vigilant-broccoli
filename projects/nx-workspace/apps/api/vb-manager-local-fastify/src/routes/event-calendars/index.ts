import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as eventCalendarsRoute from './event-calendars.route';
import * as idRoute from './id.route';
import * as idSyncRoute from './id/sync.route';
import * as untrackedRoute from './untracked.route';
import * as untrackedCalendarIdRoute from './untracked/calendarId.route';

const eventCalendarsRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(eventCalendarsRoute.GET));
  app.post('/', webHandler(eventCalendarsRoute.POST));
  app.patch('/:id', webHandler(idRoute.PATCH));
  app.delete('/:id', webHandler(idRoute.DELETE));
  app.get('/:id/sync', webHandler(idSyncRoute.GET));
  app.post('/:id/sync', webHandler(idSyncRoute.POST));
  app.get('/untracked', webHandler(untrackedRoute.GET));
  app.delete(
    '/untracked/:calendarId',
    webHandler(untrackedCalendarIdRoute.DELETE),
  );
};

export default eventCalendarsRoutes;
