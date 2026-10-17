import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as diskSpaceRoute from './disk-space.route';

const diskSpaceRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(diskSpaceRoute.GET));
};

export default diskSpaceRoutes;
