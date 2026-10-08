import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as statusRoute from './status.route';

const wireguardRoutes: FastifyPluginAsync = async app => {
  app.get('/status', webHandler(statusRoute.GET));
};

export default wireguardRoutes;
