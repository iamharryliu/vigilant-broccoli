import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as appsRoute from './apps.route';
import * as authLoginRoute from './auth/login.route';

const flyioRoutes: FastifyPluginAsync = async app => {
  app.get('/apps', webHandler(appsRoute.GET));
  app.post('/auth/login', webHandler(authLoginRoute.POST));
};

export default flyioRoutes;
