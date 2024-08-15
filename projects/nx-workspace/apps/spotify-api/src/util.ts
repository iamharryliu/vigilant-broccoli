import fs from 'fs';
import path from 'path';
import {
  REDIRECT_URI,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
} from './const';

export async function getAccessToken(code: string) {
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          'base64',
        ),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const json = await response.json();

  return json.access_token;
}

export async function fetchPlaylists(accessToken) {
  const allPlaylists = [];
  let nextUrl = 'https://api.spotify.com/v1/me/playlists';
  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const playlistsData = await response.json();
    allPlaylists.push(...playlistsData.items);
    nextUrl = playlistsData.next;
  }
  const playlists = allPlaylists
    .filter(
      playlist =>
        playlist.description &&
        playlist.description.toLowerCase().includes('mix'),
    )
    .map(playlist => ({
      name: playlist.name,
      url: playlist.external_urls.spotify,
    }));
  return playlists;
}

export const savePlaylistsDataToOutputFile = playlists => {
  const filePath = path.join(process.env.HOME, process.env.OUTPUT_DIRECTORY);
  const directoryPath = path.dirname(filePath);
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
  const playlistsJson = JSON.stringify(playlists, null, 2);
  fs.writeFile(filePath, playlistsJson, 'utf8', err => {
    if (err) throw err;
    console.log('Playlist data saved to:', filePath);
  });
};
