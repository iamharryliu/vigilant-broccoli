import { FastifyPluginAsync } from 'fastify';
import { webHandler } from '../../libs/web-handler';
import * as downloadRoute from './download.route';
import * as openRekordboxRoute from './open-rekordbox.route';
import * as playlistsRoute from './playlists.route';

const djRoutes: FastifyPluginAsync = async app => {
  app.post('/download', webHandler(downloadRoute.POST));
  app.post('/open-rekordbox', webHandler(openRekordboxRoute.POST));
  app.get('/playlists', webHandler(playlistsRoute.GET));
};

export default djRoutes;
