import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as defineRoute from './define.route';
import * as historyRoute from './history.route';
import * as masteredRoute from './mastered.route';
import * as resetRoute from './reset.route';
import * as wordsRoute from './words.route';

const languageLearningRoutes: FastifyPluginAsync = async app => {
  app.post('/define', webHandler(defineRoute.POST));
  app.get('/history', webHandler(historyRoute.GET));
  app.get('/mastered', webHandler(masteredRoute.GET));
  app.post('/mastered', webHandler(masteredRoute.POST));
  app.delete('/mastered', webHandler(masteredRoute.DELETE));
  app.delete('/reset', webHandler(resetRoute.DELETE));
  app.post('/words', webHandler(wordsRoute.POST));
};

export default languageLearningRoutes;
