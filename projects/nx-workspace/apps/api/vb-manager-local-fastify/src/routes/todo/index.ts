import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as todoRoute from './todo.route';
import * as solveRoute from './solve.route';

const todoRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(todoRoute.GET));
  app.put('/', webHandler(todoRoute.PUT));
  app.post('/solve', webHandler(solveRoute.POST));
};

export default todoRoutes;
