import express from 'express';
import {
  fetchPlaylists,
  getAccessToken,
  savePlaylistsDataToOutputFile,
} from './util';
import { HOST, PORT, authorizeUrl } from './const';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

const app = express();

app.get('/', (_, res) => {
  res.redirect(authorizeUrl);
});

app.get('/callback', async (req, res) => {
  const code = (req.query.code as string) || null;
  const accessToken = await getAccessToken(code);
  const playlists = await fetchPlaylists(accessToken);
  if (getEnvironmentVariable('NODE_ENV') === 'LOCAL') {
    savePlaylistsDataToOutputFile(playlists);
    res.json(playlists);
    return;
  }
  res.setHeader('Content-Disposition', 'attachment; filename="playlists.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(playlists, null, 2));
});

app.listen(PORT, HOST, () => {
  console.log(`[ ready ] http://${HOST}:${PORT}`);
});
