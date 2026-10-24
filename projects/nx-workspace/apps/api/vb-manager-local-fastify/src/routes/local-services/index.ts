import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as localServicesRoute from './local-services.route';

const localServicesRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(localServicesRoute.GET));
};

export default localServicesRoutes;
