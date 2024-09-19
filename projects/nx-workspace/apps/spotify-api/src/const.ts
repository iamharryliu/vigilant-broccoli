export const HOST = process.env.HOST || 'localhost';
export const PORT = 8080;

export const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
export const REDIRECT_URI =
  process.env.NODE_ENV === 'LOCAL'
    ? `http://${HOST}:${PORT}/callback`
    : 'https://spotify-playlist-getter.fly.dev/callback';

const scopes = 'playlist-read-private';
export const authorizeUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(
  scopes,
)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
