import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as sshKeyRoute from './ssh-key.route';

const sshKeyRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(sshKeyRoute.GET));
};

export default sshKeyRoutes;
