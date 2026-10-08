import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as textToSpeechRoute from './text-to-speech.route';

const textToSpeechRoutes: FastifyPluginAsync = async app => {
  app.post('/', webHandler(textToSpeechRoute.POST));
};

export default textToSpeechRoutes;
