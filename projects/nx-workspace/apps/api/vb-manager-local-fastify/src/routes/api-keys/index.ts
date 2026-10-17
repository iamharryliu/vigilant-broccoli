import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as apiKeysRoute from './api-keys.route';
import * as idRoute from './id.route';

const apiKeysRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(apiKeysRoute.GET));
  app.post('/', webHandler(apiKeysRoute.POST));
  app.patch('/:id', webHandler(idRoute.PATCH));
  app.delete('/:id', webHandler(idRoute.DELETE));
};

export default apiKeysRoutes;
