import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as weatherRoute from './weather.route';

const weatherRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(weatherRoute.GET));
};

export default weatherRoutes;
