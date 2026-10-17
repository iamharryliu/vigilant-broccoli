import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as chatRoute from './chat.route';
import * as publishRoute from './publish.route';

const chatRoutes: FastifyPluginAsync = async app => {
  app.post('/', webHandler(chatRoute.POST));
  app.post('/publish', webHandler(publishRoute.POST));
};

export default chatRoutes;
