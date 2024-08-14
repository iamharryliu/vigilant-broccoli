import express from 'express';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = 'http://localhost:3000/callback';

const app = express();

app.get('/login', (req, res) => {
  const scopes = 'playlist-read-private';
  const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(authorizeUrl);
});

app.get('/callback', async (req, res) => {  const code = req.query.code || null;
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code as string);
  params.append('redirect_uri', redirectUri);

  // Exchange the authorization code for an access token
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

  // Function to fetch playlists and handle pagination
  async function fetchAllPlaylists(url) {
    const allPlaylists = [];
    let nextUrl = url;

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const playlistsData = await response.json();

      // Add the current batch of playlists to the allPlaylists array
      allPlaylists.push(...playlistsData.items);

      // Update nextUrl to the next page of results
      nextUrl = playlistsData.next;
    }

    return allPlaylists;
  }

  // Fetch all playlists
  const allPlaylists = await fetchAllPlaylists('https://api.spotify.com/v1/me/playlists');

  // Filter playlists with description containing 'mix'
  const filteredPlaylists = allPlaylists.filter(playlist => 
    playlist.description && playlist.description.toLowerCase().includes('mix')
  );

  // Map the filtered playlists to only include name and URL
  const mappedPlaylists = filteredPlaylists.map(playlist => ({
    name: playlist.name,
    url: playlist.external_urls.spotify
  }));

  // Respond with the mapped playlists
  res.json(mappedPlaylists);
});


app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
