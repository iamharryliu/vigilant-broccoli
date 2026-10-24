import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as containersRoute from './containers.route';
import * as removeRoute from './remove.route';
import * as startRoute from './start.route';
import * as stopRoute from './stop.route';

const dockerRoutes: FastifyPluginAsync = async app => {
  app.get('/containers', webHandler(containersRoute.GET));
  app.post('/remove', webHandler(removeRoute.POST));
  app.post('/start', webHandler(startRoute.POST));
  app.post('/stop', webHandler(stopRoute.POST));
};

export default dockerRoutes;
