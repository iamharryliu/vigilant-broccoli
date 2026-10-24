import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as profilesRoute from './profiles.route';

const awsRoutes: FastifyPluginAsync = async app => {
  app.get('/profiles', webHandler(profilesRoute.GET));
};

export default awsRoutes;
