import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as authStatusRoute from './auth-status.route';
import * as projectsRoute from './projects.route';
import * as reauthNeededRoute from './reauth-needed.route';
import * as setAccountRoute from './set-account.route';
import * as setProjectRoute from './set-project.route';
import * as vaultTokenRoute from './vault-token.route';

const gcloudRoutes: FastifyPluginAsync = async app => {
  app.get('/auth-status', webHandler(authStatusRoute.GET));
  app.get('/projects', webHandler(projectsRoute.GET));
  app.get('/reauth-needed', webHandler(reauthNeededRoute.GET));
  app.post('/set-account', webHandler(setAccountRoute.POST));
  app.post('/set-project', webHandler(setProjectRoute.POST));
  app.post('/vault-token', webHandler(vaultTokenRoute.POST));
};

export default gcloudRoutes;
