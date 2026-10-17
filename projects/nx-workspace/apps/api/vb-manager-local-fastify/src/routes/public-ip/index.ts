import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as publicIpRoute from './public-ip.route';

const publicIpRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(publicIpRoute.GET));
};

export default publicIpRoutes;
