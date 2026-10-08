import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as resumeRoute from './resume.route';
import * as chatRoute from './chat.route';
import * as pdfRoute from './pdf.route';

const resumeRoutes: FastifyPluginAsync = async app => {
  app.get('/', webHandler(resumeRoute.GET));
  app.put('/', webHandler(resumeRoute.PUT));
  app.post('/chat', webHandler(chatRoute.POST));
  app.post('/pdf', webHandler(pdfRoute.POST));
};

export default resumeRoutes;
