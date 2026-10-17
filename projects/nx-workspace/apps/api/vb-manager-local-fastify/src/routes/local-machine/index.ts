import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as localMachineRoute from './local-machine.route';

const localMachineRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(localMachineRoute.GET));
};

export default localMachineRoutes;
