export const HOST = 'localhost';
export const PORT = 8080;

export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
export const REDIRECT_URI = `http://${HOST}:${PORT}/callback`;

const scopes = 'playlist-read-private';
export const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(
  scopes,
)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
