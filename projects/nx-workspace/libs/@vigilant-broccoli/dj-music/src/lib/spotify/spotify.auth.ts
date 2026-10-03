import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import {
  SPOTIFY_ACCOUNTS_TOKEN_URL,
  SPOTIFY_GRANT_TYPE,
  TOKEN_EXPIRY_SKEW_MS,
} from './spotify.consts';
import type {
  FetchLike,
  SpotifyCredentials,
  SpotifyTokenResponse,
  TokenProvider,
  TokenProviderDeps,
} from './spotify.types';

const MS_PER_SECOND = 1000;

const basicAuthHeader = ({
  clientId,
  clientSecret,
}: SpotifyCredentials): string =>
  `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

const requestToken = async (
  credentials: SpotifyCredentials,
  body: URLSearchParams,
  fetchImpl: FetchLike,
): Promise<SpotifyTokenResponse> => {
  const response = await fetchImpl(SPOTIFY_ACCOUNTS_TOKEN_URL, {
    method: HTTP_METHOD.POST,
    headers: {
      ...HTTP_HEADERS.CONTENT_TYPE.FORM,
      Authorization: basicAuthHeader(credentials),
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Spotify token request failed (${response.status}): ${detail}`,
    );
  }

  return (await response.json()) as SpotifyTokenResponse;
};

/**
 * Wraps a token fetcher with in-memory caching. Tokens are reused until they
 * are within `TOKEN_EXPIRY_SKEW_MS` of expiry, and concurrent callers share one
 * in-flight request rather than each triggering their own.
 */
const withCaching = (
  fetchToken: () => Promise<SpotifyTokenResponse>,
  now: () => number,
): TokenProvider => {
  let cachedToken: string | null = null;
  let expiresAt = 0;
  let inFlight: Promise<string> | null = null;

  return async () => {
    if (cachedToken && now() < expiresAt - TOKEN_EXPIRY_SKEW_MS) {
      return cachedToken;
    }
    if (inFlight) {
      return inFlight;
    }

    inFlight = fetchToken()
      .then(token => {
        cachedToken = token.access_token;
        expiresAt = now() + token.expires_in * MS_PER_SECOND;
        return cachedToken;
      })
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  };
};

/**
 * App-only auth. Reads public catalogue data and public playlists with no user
 * interaction, which is what an unattended CI check needs. It cannot read a
 * user's private or collaborative playlists — use
 * `createRefreshTokenProvider` for those.
 */
export const createClientCredentialsTokenProvider = (
  credentials: SpotifyCredentials,
  { fetch: fetchImpl, now = Date.now }: TokenProviderDeps,
): TokenProvider =>
  withCaching(
    () =>
      requestToken(
        credentials,
        new URLSearchParams({
          grant_type: SPOTIFY_GRANT_TYPE.CLIENT_CREDENTIALS,
        }),
        fetchImpl,
      ),
    now,
  );

/**
 * User auth for private and collaborative playlists. Spotify refresh tokens do
 * not expire on their own, so one obtained interactively can drive an
 * unattended job until it is revoked.
 */
export const createRefreshTokenProvider = (
  credentials: SpotifyCredentials,
  refreshToken: string,
  { fetch: fetchImpl, now = Date.now }: TokenProviderDeps,
): TokenProvider =>
  withCaching(
    () =>
      requestToken(
        credentials,
        new URLSearchParams({
          grant_type: SPOTIFY_GRANT_TYPE.REFRESH_TOKEN,
          refresh_token: refreshToken,
        }),
        fetchImpl,
      ),
    now,
  );
