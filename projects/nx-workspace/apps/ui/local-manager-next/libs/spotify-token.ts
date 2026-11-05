import {
  AUTHORIZATION_HEADER,
  CONTENT_TYPE_HEADER,
  HTTP_STATUS_CODES,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { supabaseAdmin } from '../src/lib/supabase-admin';

const SPOTIFY_OAUTH_TOKENS_TABLE = 'spotify_oauth_tokens';
const USER_EMAIL_COLUMN = 'user_email';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_CLIENT_ID_ENV = 'SPOTIFY_CLIENT_ID';
const SPOTIFY_CLIENT_SECRET_ENV = 'SPOTIFY_CLIENT_SECRET';
const SPOTIFY_CALLBACK_PATH = '/api/spotify/auth/callback';
const SPOTIFY_NOT_CONNECTED = 'spotify_not_connected';
// PostgREST's code for .single() matching zero rows — the expected shape for
// a user who hasn't connected Spotify yet, distinct from a real query error
// (e.g. the table missing) which must not be swallowed as "not connected".
const SINGLE_ROW_NOT_FOUND_CODE = 'PGRST116';
const GRANT_TYPE_REFRESH_TOKEN = 'refresh_token';
const GRANT_TYPE_AUTHORIZATION_CODE = 'authorization_code';
const FORM_URLENCODED_CONTENT_TYPE = 'application/x-www-form-urlencoded';
// Refresh a little early so an access token never expires mid-request.
const EXPIRY_SAFETY_MARGIN_MS = 60_000;

interface SpotifyTokenRow {
  refresh_token: string;
  access_token: string | null;
  access_token_expires_at: string | null;
}

interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

const basicAuthHeader = (): string =>
  `Basic ${Buffer.from(
    `${getEnvironmentVariable(SPOTIFY_CLIENT_ID_ENV)}:${getEnvironmentVariable(SPOTIFY_CLIENT_SECRET_ENV)}`,
  ).toString('base64')}`;

// PM2 fronts this app behind a reverse proxy that doesn't forward a Host
// header Next can trust, so request.nextUrl.origin resolves to the internal
// bind address (e.g. localhost:1337), not the public domain Spotify's
// dashboard has registered as the redirect URI. SPOTIFY_REDIRECT_BASE_URL is
// set in ecosystem.config.js (a plain, non-secret deploy-time constant, same
// as VB_EXPRESS_URL/NEXT_PUBLIC_SUPABASE_URL there) for the one real
// deployment; unset locally, where request.nextUrl.origin is trustworthy
// since next dev has no reverse proxy in front of it.
export const spotifyAppOrigin = (requestOrigin: string): string =>
  process.env.SPOTIFY_REDIRECT_BASE_URL || requestOrigin;

export const spotifyRedirectUri = (requestOrigin: string): string =>
  `${spotifyAppOrigin(requestOrigin)}${SPOTIFY_CALLBACK_PATH}`;

export const storeSpotifyRefreshToken = async (
  userEmail: string,
  refreshToken: string,
): Promise<void> => {
  const { error } = await supabaseAdmin.from(SPOTIFY_OAUTH_TOKENS_TABLE).upsert(
    {
      user_email: userEmail,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    },
    { onConflict: USER_EMAIL_COLUMN },
  );
  if (error) throw new Error(`Failed to store Spotify token: ${error.message}`);
};

const refreshSpotifyAccessToken = async (
  refreshToken: string,
): Promise<SpotifyTokenResponse> => {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      [CONTENT_TYPE_HEADER]: FORM_URLENCODED_CONTENT_TYPE,
      [AUTHORIZATION_HEADER]: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    if (response.status === HTTP_STATUS_CODES.BAD_REQUEST) {
      throw new Error(SPOTIFY_NOT_CONNECTED);
    }
    throw new Error(`Spotify token refresh failed: ${response.status}`);
  }

  return response.json();
};

export const exchangeSpotifyAuthorizationCode = async (
  code: string,
  redirectUri: string,
): Promise<{ refreshToken: string }> => {
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      [CONTENT_TYPE_HEADER]: FORM_URLENCODED_CONTENT_TYPE,
      [AUTHORIZATION_HEADER]: basicAuthHeader(),
    },
    body: new URLSearchParams({
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Spotify code exchange failed: ${response.status}`);
  }

  const tokens: SpotifyTokenResponse = await response.json();
  if (!tokens.refresh_token) {
    throw new Error('Spotify code exchange did not return a refresh token');
  }
  return { refreshToken: tokens.refresh_token };
};

export const getSpotifyAccessTokenForUser = async (
  userEmail: string,
): Promise<string> => {
  const { data, error } = await supabaseAdmin
    .from(SPOTIFY_OAUTH_TOKENS_TABLE)
    .select('refresh_token, access_token, access_token_expires_at')
    .eq(USER_EMAIL_COLUMN, userEmail)
    .single<SpotifyTokenRow>();

  if (error && error.code !== SINGLE_ROW_NOT_FOUND_CODE) {
    throw new Error(`Failed to read Spotify token: ${error.message}`);
  }
  if (!data?.refresh_token) throw new Error(SPOTIFY_NOT_CONNECTED);

  const expiresAtMs = data.access_token_expires_at
    ? new Date(data.access_token_expires_at).getTime()
    : null;
  const stillValid =
    data.access_token &&
    expiresAtMs &&
    expiresAtMs - EXPIRY_SAFETY_MARGIN_MS > Date.now();
  if (stillValid) return data.access_token as string;

  const refreshed = await refreshSpotifyAccessToken(data.refresh_token);
  const expiresAt = new Date(
    Date.now() + refreshed.expires_in * 1000,
  ).toISOString();

  await supabaseAdmin
    .from(SPOTIFY_OAUTH_TOKENS_TABLE)
    .update({
      access_token: refreshed.access_token,
      access_token_expires_at: expiresAt,
      // Spotify only rotates the refresh token occasionally; keep it when absent.
      ...(refreshed.refresh_token && {
        refresh_token: refreshed.refresh_token,
      }),
    })
    .eq(USER_EMAIL_COLUMN, userEmail);

  return refreshed.access_token;
};

export const isSpotifyNotConnectedError = (error: unknown): boolean =>
  error instanceof Error && error.message === SPOTIFY_NOT_CONNECTED;
