import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as organizationMembersRoute from './organization-members.route';
import * as organizationStructureRoute from './organization-structure.route';
import * as organizationMemberListRoute from './organization/members.route';
import * as organizationMetaRoute from './organization/meta.route';
import * as organizationRepositoriesRoute from './organization/repositories.route';
import * as organizationTeamsRoute from './organization/teams.route';
import * as pagesRoute from './pages.route';
import * as userOrganizationsRoute from './user/organizations.route';

const githubRoutes: FastifyPluginAsync = async app => {
  app.post('/organization-members', webHandler(organizationMembersRoute.POST));
  app.delete(
    '/organization-members',
    webHandler(organizationMembersRoute.DELETE),
  );
  app.get(
    '/organization-structure',
    webHandler(organizationStructureRoute.GET),
  );
  app.get('/organization/members', webHandler(organizationMemberListRoute.GET));
  app.get('/organization/meta', webHandler(organizationMetaRoute.GET));
  app.get(
    '/organization/repositories',
    webHandler(organizationRepositoriesRoute.GET),
  );
  app.post(
    '/organization/repositories',
    webHandler(organizationRepositoriesRoute.POST),
  );
  app.delete(
    '/organization/repositories',
    webHandler(organizationRepositoriesRoute.DELETE),
  );
  app.get('/organization/teams', webHandler(organizationTeamsRoute.GET));
  app.post('/organization/teams', webHandler(organizationTeamsRoute.POST));
  app.delete('/organization/teams', webHandler(organizationTeamsRoute.DELETE));
  app.get('/pages', webHandler(pagesRoute.GET));
  app.get('/user/organizations', webHandler(userOrganizationsRoute.GET));
};

export default githubRoutes;
