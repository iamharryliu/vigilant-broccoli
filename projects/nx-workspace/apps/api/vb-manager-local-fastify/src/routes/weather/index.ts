import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as cityRoute from './city.route';
import * as weatherRoute from './weather.route';

const weatherRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(weatherRoute.GET));
  app.get('/city', webHandler(cityRoute.GET));
};

export default weatherRoutes;
