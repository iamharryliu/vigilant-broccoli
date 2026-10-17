import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as bucketRoute from './bucket.route';

const bucketRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(bucketRoute.GET));
  app.post('/', webHandler(bucketRoute.POST));
  app.delete('/', webHandler(bucketRoute.DELETE));
};

export default bucketRoutes;
