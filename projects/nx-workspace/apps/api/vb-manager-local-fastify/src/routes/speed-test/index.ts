import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as speedTestRoute from './speed-test.route';

const speedTestRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(speedTestRoute.GET));
};

export default speedTestRoutes;
