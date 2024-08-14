const express = require('express');
const fetch = require('node-fetch');
const app = express();

const clientId = 'your_client_id';
const clientSecret = 'your_client_secret';
const redirectUri = 'https://yourapp.com/callback';

app.get('/login', (req, res) => {
  const scopes = 'playlist-read-private';
  const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(authorizeUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirectUri);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const data = await response.json();
  const accessToken = data.access_token;

  // Now use the access token to access Spotify API
  const playlists = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const playlistsData = await playlists.json();
  res.json(playlistsData);
});

app.listen(8888, () => {
  console.log('Server running on http://localhost:8888');
});
