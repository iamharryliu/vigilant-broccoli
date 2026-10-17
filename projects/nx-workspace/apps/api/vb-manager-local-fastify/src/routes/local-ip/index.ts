import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as localIpRoute from './local-ip.route';

const localIpRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(localIpRoute.GET));
};

export default localIpRoutes;
