import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as speechToTextRoute from './speech-to-text.route';

const speechToTextRoutes: FastifyPluginAsync = async app => {
  app.post('/', webHandler(speechToTextRoute.POST));
};

export default speechToTextRoutes;
