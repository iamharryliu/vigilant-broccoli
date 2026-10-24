import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as localCredentialsRoute from './local-credentials.route';

const localCredentialsRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(localCredentialsRoute.GET));
};

export default localCredentialsRoutes;
