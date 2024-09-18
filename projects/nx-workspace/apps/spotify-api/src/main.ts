import express from 'express';
import {
  fetchPlaylists,
  getAccessToken,
  savePlaylistsDataToOutputFile,
} from './util';
import { HOST, PORT, authorizeUrl } from './const';

const app = express();

app.get('/', (_, res) => {
  res.redirect(authorizeUrl);
});

app.get('/callback', async (req, res) => {
  const code = (req.query.code as string) || null;
  const accessToken = await getAccessToken(code);
  const playlists = await fetchPlaylists(accessToken);
  savePlaylistsDataToOutputFile(playlists);
  res.json(playlists);
});

app.listen(PORT, HOST, () => {
  console.log(`[ ready ] http://${HOST}:${PORT}`);
});
