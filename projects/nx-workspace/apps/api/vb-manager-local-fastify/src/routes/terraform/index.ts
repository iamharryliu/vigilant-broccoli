import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as statusRoute from './status.route';

const terraformRoutes: FastifyPluginAsync = async app => {
  app.get('/status', webHandler(statusRoute.GET));
};

export default terraformRoutes;
