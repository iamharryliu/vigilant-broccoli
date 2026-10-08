import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as voiceListRoute from './voice-list.route';

const voiceListRoutes: FastifyPluginAsync = async app => {
  app.post('/', webHandler(voiceListRoute.POST));
};

export default voiceListRoutes;
