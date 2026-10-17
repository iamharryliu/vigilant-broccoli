import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as tasksRoute from './tasks.route';
import * as createRoute from './create.route';
import * as listsRoute from './lists.route';
import * as moveRoute from './move.route';
import * as parseImageRoute from './parse-image.route';
import * as parseTextRoute from './parse-text.route';

const tasksRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(tasksRoute.GET));
  app.post('/', webHandler(tasksRoute.POST));
  app.patch('/', webHandler(tasksRoute.PATCH));
  app.delete('/', webHandler(tasksRoute.DELETE));
  app.post('/create', webHandler(createRoute.POST));
  app.get('/lists', webHandler(listsRoute.GET));
  app.post('/lists', webHandler(listsRoute.POST));
  app.patch('/lists', webHandler(listsRoute.PATCH));
  app.delete('/lists', webHandler(listsRoute.DELETE));
  app.post('/move', webHandler(moveRoute.POST));
  app.post('/parse-image', webHandler(parseImageRoute.POST));
  app.post('/parse-text', webHandler(parseTextRoute.POST));
};

export default tasksRoutes;
