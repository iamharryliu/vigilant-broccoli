import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as checkoutSessionRoute from './checkout-session.route';

const stripeRoutes: FastifyPluginAsync = async app => {
  app.post('/checkout-session', webHandler(checkoutSessionRoute.POST));
};

export default stripeRoutes;
