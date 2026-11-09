import { withBasePath } from '../app.const';

export const API_ENDPOINTS = {
  DJ_PLAYLISTS: withBasePath('/api/dj/playlists'),
  DJ_DOWNLOAD: withBasePath('/api/dj/download'),
  DJ_OPEN_REKORDBOX: withBasePath('/api/dj/open-rekordbox'),

  SPOTIFY_AUTH_LOGIN: withBasePath('/api/spotify/auth/login'),
  SPOTIFY_GRAPH: withBasePath('/api/spotify/graph'),
} as const;
