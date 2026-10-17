import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as llmTestRoute from './llm-test.route';

const llmTestRoutes: FastifyPluginAsync = async app => {
  app.post('/', webHandler(llmTestRoute.POST));
};

export default llmTestRoutes;
