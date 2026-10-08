import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as deleteRoute from './delete.route';
import * as processesRoute from './processes.route';
import * as restartRoute from './restart.route';
import * as startRoute from './start.route';
import * as stopRoute from './stop.route';

const pm2Routes: FastifyPluginAsync = async app => {
  app.post('/delete', webHandler(deleteRoute.POST));
  app.get('/processes', webHandler(processesRoute.GET));
  app.post('/restart', webHandler(restartRoute.POST));
  app.post('/start', webHandler(startRoute.POST));
  app.post('/stop', webHandler(stopRoute.POST));
};

export default pm2Routes;
