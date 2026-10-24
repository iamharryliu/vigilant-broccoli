import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as executeRoute from './execute.route';

const shellRoutes: FastifyPluginAsync = async app => {
  app.post('/execute', webHandler(executeRoute.POST));
};

export default shellRoutes;
