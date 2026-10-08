import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as machinesRoute from './machines.route';

const tailscaleRoutes: FastifyPluginAsync = async app => {
  app.get('/machines', webHandler(machinesRoute.GET));
};

export default tailscaleRoutes;
