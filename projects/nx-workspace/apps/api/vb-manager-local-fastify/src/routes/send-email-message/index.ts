import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as sendEmailMessageRoute from './send-email-message.route';

const sendEmailMessageRoutes: FastifyPluginAsync = async app => {
  app.post('/', webHandler(sendEmailMessageRoute.POST));
};

export default sendEmailMessageRoutes;
