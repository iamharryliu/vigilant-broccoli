import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as preparationRoute from './preparation.route';

const preparationRoutes: FastifyPluginAsync = async app => {
  app.post('/', webHandler(preparationRoute.POST));
};

export default preparationRoutes;
