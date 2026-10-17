// The Music page both the OAuth callback redirects to and the SPA routes.
export const SPOTIFY_MUSIC_PATH = '/music';

export const SPOTIFY_ERROR_QUERY_PARAM = 'spotifyError';

export const SPOTIFY_OAUTH_ERROR = {
  MISSING_CODE: 'missing_code',
  INVALID_STATE: 'invalid_state',
  TOKEN_EXCHANGE_FAILED: 'token_exchange_failed',
} as const;

export interface SpotifyPlaylistDetail {
  id: string;
  name: string;
  owner: string;
  trackCount: number;
  url: string;
}
