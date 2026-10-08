import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as scrapeRoute from './scrape.route';
import * as scrapePreviewRoute from './scrape-preview.route';

const recipeRoutes: FastifyPluginAsync = async app => {
  app.post('/scrape', webHandler(scrapeRoute.POST));
  app.post('/scrape-preview', webHandler(scrapePreviewRoute.POST));
};

export default recipeRoutes;
