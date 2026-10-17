import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as qrCodeRoute from './qr-code.route';

const qrCodeRoutes: FastifyPluginAsync = async app => {
  app.post('/', webHandler(qrCodeRoute.POST));
};

export default qrCodeRoutes;
