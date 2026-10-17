import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as notepadRoute from './notepad.route';

const notepadRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(notepadRoute.GET));
  app.post('/', webHandler(notepadRoute.POST));
};

export default notepadRoutes;
