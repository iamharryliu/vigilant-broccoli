import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as outfitRecommendationRoute from './outfit-recommendation.route';

const outfitRecommendationRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(outfitRecommendationRoute.GET));
};

export default outfitRecommendationRoutes;
