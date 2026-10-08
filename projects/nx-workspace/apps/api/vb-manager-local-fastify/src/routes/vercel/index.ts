import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as projectsRoute from './projects.route';

const vercelRoutes: FastifyPluginAsync = async app => {
  app.get('/projects', webHandler(projectsRoute.GET));
};

export default vercelRoutes;
