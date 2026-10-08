import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as generateSecretRoute from './generate-secret.route';

const generateSecretRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(generateSecretRoute.GET));
};

export default generateSecretRoutes;
