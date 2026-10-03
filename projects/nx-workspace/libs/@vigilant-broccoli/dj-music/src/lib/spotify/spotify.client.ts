import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import {
  RETRY_AFTER_HEADER,
  SERVER_ERROR_THRESHOLD,
  SPOTIFY_API_BASE_URL,
  SPOTIFY_PAGE_LIMIT,
  SPOTIFY_REF_TYPE,
  SPOTIFY_RETRY,
  SPOTIFY_SEARCH_DEFAULT_LIMIT,
  TOO_MANY_REQUESTS,
} from './spotify.consts';
import {
  toMusicTrack,
  toPlaylistSummary,
  toPlaylistTracks,
} from './spotify.mappers';
import type {
  FetchLike,
  PlaylistPageOptions,
  PlaylistTracksPage,
  PlaylistTracksResult,
  SpotifyClientDeps,
  SpotifyPage,
  SpotifyPlaylistItem,
  SpotifyPlaylistObject,
  SpotifyPlaylistSummary,
  SpotifyTrackObject,
} from './spotify.types';
import type { MusicTrack } from '../track.types';

const MS_PER_SECOND = 1000;

export class SpotifyApiError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
    readonly detail: string,
  ) {
    super(`Spotify request to ${url} failed (${status}): ${detail}`);
    this.name = 'SpotifyApiError';
  }
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Spotify sends `Retry-After` in whole seconds on a 429. Honouring it is not
 * optional — ignoring it escalates to longer lockouts on the client id.
 */
const retryAfterMs = (response: {
  headers: { get(n: string): string | null };
}): number => {
  const header = response.headers.get(RETRY_AFTER_HEADER);
  const seconds = header ? Number(header) : Number.NaN;
  return Number.isFinite(seconds)
    ? seconds * MS_PER_SECOND
    : SPOTIFY_RETRY.defaultRetryAfterMs;
};

export const createSpotifyClient = ({
  fetch: fetchImpl,
  getToken,
  sleep = defaultSleep,
  maxAttempts = SPOTIFY_RETRY.maxAttempts,
  requestTimeoutMs = SPOTIFY_RETRY.requestTimeoutMs,
  market,
}: SpotifyClientDeps) => {
  const requestUrl = async <T>(url: string): Promise<T> => {
    let lastError: SpotifyApiError | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const token = await getToken();
      const response = await fetchImpl(url, {
        method: HTTP_METHOD.GET,
        headers: {
          ...HTTP_HEADERS.ACCEPT.JSON,
          ...HTTP_HEADERS.AUTHORIZATION(token),
        },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      const detail = await response.text();
      lastError = new SpotifyApiError(response.status, url, detail);

      const isRetryable =
        response.status === TOO_MANY_REQUESTS ||
        response.status >= SERVER_ERROR_THRESHOLD;
      if (!isRetryable || attempt === maxAttempts) {
        throw lastError;
      }

      const delayMs =
        response.status === TOO_MANY_REQUESTS
          ? retryAfterMs(response)
          : SPOTIFY_RETRY.backoffBaseMs * 2 ** (attempt - 1);
      if (delayMs > SPOTIFY_RETRY.maxRetryDelayMs) {
        throw lastError;
      }
      await sleep(delayMs);
    }

    throw lastError ?? new SpotifyApiError(0, url, 'no attempts made');
  };

  const buildUrl = (
    path: string,
    params: Record<string, string> = {},
  ): string => {
    const url = new URL(`${SPOTIFY_API_BASE_URL}${path}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    if (market) {
      url.searchParams.set('market', market);
    }
    return url.toString();
  };

  /** Follows Spotify's `next` cursor to the end and concatenates every page. */
  const paginate = async <T>(firstUrl: string): Promise<T[]> => {
    const collected: T[] = [];
    let nextUrl: string | null = firstUrl;

    while (nextUrl) {
      const page: SpotifyPage<T> = await requestUrl<SpotifyPage<T>>(nextUrl);
      collected.push(...page.items);
      nextUrl = page.next;
    }

    return collected;
  };

  const getTrack = async (id: string): Promise<MusicTrack> =>
    toMusicTrack(
      await requestUrl<SpotifyTrackObject>(buildUrl(`/tracks/${id}`)),
    );

  /**
   * Catalogue search. Unlike the playlist endpoints this stays available to an
   * app-only (client-credentials) token, so it is the one live check that works
   * without user auth.
   */
  const searchTracks = async (
    query: string,
    limit = SPOTIFY_SEARCH_DEFAULT_LIMIT,
  ): Promise<MusicTrack[]> => {
    const result = await requestUrl<{
      tracks?: SpotifyPage<SpotifyTrackObject>;
    }>(
      buildUrl('/search', {
        q: query,
        type: SPOTIFY_REF_TYPE.TRACK,
        limit: String(limit),
      }),
    );
    return (result.tracks?.items ?? []).map(toMusicTrack);
  };

  const getPlaylist = async (id: string): Promise<SpotifyPlaylistSummary> =>
    toPlaylistSummary(
      await requestUrl<SpotifyPlaylistObject>(buildUrl(`/playlists/${id}`)),
    );

  /**
   * A single page. Lets a caller that only needs a sample — a liveness check,
   * a preview — avoid walking a playlist that may run to thousands of items.
   */
  const getPlaylistTracksPage = async (
    id: string,
    {
      limit = SPOTIFY_PAGE_LIMIT.PLAYLIST_ITEMS,
      offset = 0,
    }: PlaylistPageOptions = {},
  ): Promise<PlaylistTracksPage> => {
    const page = await requestUrl<SpotifyPage<SpotifyPlaylistItem>>(
      buildUrl(`/playlists/${id}/tracks`, {
        limit: String(limit),
        offset: String(offset),
      }),
    );
    return {
      ...toPlaylistTracks(page.items),
      total: page.total ?? 0,
      hasNext: page.next !== null,
    };
  };

  const getPlaylistTracks = async (
    id: string,
  ): Promise<PlaylistTracksResult> => {
    const items = await paginate<SpotifyPlaylistItem>(
      buildUrl(`/playlists/${id}/tracks`, {
        limit: String(SPOTIFY_PAGE_LIMIT.PLAYLIST_ITEMS),
      }),
    );
    return toPlaylistTracks(items);
  };

  /** Requires a user token; a client-credentials token yields 401 here. */
  const getCurrentUserPlaylists = async (): Promise<
    SpotifyPlaylistSummary[]
  > => {
    const items = await paginate<SpotifyPlaylistObject>(
      buildUrl('/me/playlists', {
        limit: String(SPOTIFY_PAGE_LIMIT.PLAYLISTS),
      }),
    );
    return items.map(toPlaylistSummary);
  };

  return {
    getTrack,
    searchTracks,
    getPlaylist,
    getPlaylistTracks,
    getPlaylistTracksPage,
    getCurrentUserPlaylists,
    requestUrl,
    paginate,
  };
};

export type SpotifyClient = ReturnType<typeof createSpotifyClient>;
export type { FetchLike };
