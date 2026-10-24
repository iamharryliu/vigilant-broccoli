import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as callbackRoute from './callback.route';
import * as graphRoute from './graph.route';
import * as loginRoute from './login.route';

const spotifyRoutes: FastifyPluginAsync = async app => {
  app.get('/auth/login', webHandler(loginRoute.GET));
  app.get('/auth/callback', webHandler(callbackRoute.GET));
  app.get('/graph', webHandler(graphRoute.GET));
};

export default spotifyRoutes;
