import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as boardsRoute from './boards.route';

const kanbanRoutes: FastifyPluginAsync = async app => {
  app.get('/boards', webHandler(boardsRoute.GET));
  app.put('/boards', webHandler(boardsRoute.PUT));
};

export default kanbanRoutes;
