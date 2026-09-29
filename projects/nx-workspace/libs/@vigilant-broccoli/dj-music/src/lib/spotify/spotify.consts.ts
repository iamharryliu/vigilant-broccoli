export const SPOTIFY_ACCOUNTS_TOKEN_URL =
  'https://accounts.spotify.com/api/token';
export const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

export const SPOTIFY_REF_TYPE = {
  TRACK: 'track',
  PLAYLIST: 'playlist',
  ALBUM: 'album',
  ARTIST: 'artist',
} as const;

export const SPOTIFY_GRANT_TYPE = {
  CLIENT_CREDENTIALS: 'client_credentials',
  REFRESH_TOKEN: 'refresh_token',
} as const;

/** Spotify's documented maximums; a smaller page just costs more round trips. */
export const SPOTIFY_PAGE_LIMIT = {
  PLAYLISTS: 50,
  PLAYLIST_ITEMS: 100,
} as const;

export const SPOTIFY_SEARCH_DEFAULT_LIMIT = 5;

/** Refresh this long before actual expiry so a token can't die mid-flight. */
export const TOKEN_EXPIRY_SKEW_MS = 60_000;

export const SPOTIFY_RETRY = {
  maxAttempts: 4,
  /** Fallback when a 429 arrives without a `Retry-After` header. */
  defaultRetryAfterMs: 2_000,
  backoffBaseMs: 500,
  /**
   * Hard ceiling on a single retry sleep. Spotify can answer a 429 with a
   * `Retry-After` of hours; obeying that literally would hang a caller well
   * past any CI job timeout with no output. Past this we give up and surface
   * the 429 instead of sleeping on it.
   */
  maxRetryDelayMs: 10_000,
  /** Per-request ceiling so a stalled socket fails instead of hanging. */
  requestTimeoutMs: 15_000,
} as const;

export const RETRY_AFTER_HEADER = 'retry-after';
export const TOO_MANY_REQUESTS = 429;
export const SERVER_ERROR_THRESHOLD = 500;

/** A playlist row whose `track` is absent, an episode, or a local file. */
export const SKIPPED_ITEM_REASON = {
  MISSING: 'missing',
  NOT_A_TRACK: 'not-a-track',
  LOCAL: 'local',
} as const;
