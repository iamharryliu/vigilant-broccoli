import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as googleTokenRoute from './google-token.route';

const authRoutes: FastifyPluginAsync = async app => {
  app.post('/google-token', webHandler(googleTokenRoute.POST));
};

export default authRoutes;
