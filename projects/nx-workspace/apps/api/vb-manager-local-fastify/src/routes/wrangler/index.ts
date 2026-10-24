import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as loginRoute from './login.route';
import * as pagesRoute from './pages.route';

const wranglerRoutes: FastifyPluginAsync = async app => {
  app.post('/login', webHandler(loginRoute.POST));
  app.get('/pages', webHandler(pagesRoute.GET));
  app.delete('/pages', webHandler(pagesRoute.DELETE));
};

export default wranglerRoutes;
