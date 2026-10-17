import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as sendTextMessageRoute from './send-text-message.route';

const sendTextMessageRoutes: FastifyPluginAsync = async app => {
  app.post('/', webHandler(sendTextMessageRoute.POST));
};

export default sendTextMessageRoutes;
