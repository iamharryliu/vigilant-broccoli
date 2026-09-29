import type { SPOTIFY_REF_TYPE, SKIPPED_ITEM_REASON } from './spotify.consts';
import type { MusicTrack } from '../track.types';

export type SpotifyRefType =
  (typeof SPOTIFY_REF_TYPE)[keyof typeof SPOTIFY_REF_TYPE];

export type SkippedItemReason =
  (typeof SKIPPED_ITEM_REASON)[keyof typeof SKIPPED_ITEM_REASON];

export interface SpotifyRef {
  readonly type: SpotifyRefType;
  readonly id: string;
}

/**
 * Structural subset of the Fetch API. Declared locally rather than pulled from
 * DOM/undici types so tests can pass a plain object and the lib stays runtime
 * agnostic.
 */
export interface FetchResponseLike {
  readonly ok: boolean;
  readonly status: number;
  readonly headers: { get(name: string): string | null };
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export interface FetchRequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

export type FetchLike = (
  url: string,
  init?: FetchRequestInit,
) => Promise<FetchResponseLike>;

export type TokenProvider = () => Promise<string>;

export interface SpotifyCredentials {
  readonly clientId: string;
  readonly clientSecret: string;
}

export interface TokenProviderDeps {
  readonly fetch: FetchLike;
  /** Injected for deterministic expiry tests; defaults to `Date.now`. */
  readonly now?: () => number;
}

export interface SpotifyTokenResponse {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number;
  readonly refresh_token?: string;
}

export interface SpotifyClientDeps {
  readonly fetch: FetchLike;
  readonly getToken: TokenProvider;
  /** Injected so retry tests do not actually wait; defaults to a real timer. */
  readonly sleep?: (ms: number) => Promise<void>;
  readonly maxAttempts?: number;
  /** Per-request abort ceiling, so a stalled socket fails instead of hanging. */
  readonly requestTimeoutMs?: number;
  /** ISO 3166-1 alpha-2 market used to resolve track relinking. */
  readonly market?: string;
}

export interface SpotifyImage {
  readonly url: string;
  readonly width?: number | null;
  readonly height?: number | null;
}

export interface SpotifyArtistObject {
  readonly name: string;
}

export interface SpotifyAlbumObject {
  readonly name?: string;
  readonly artists?: readonly SpotifyArtistObject[];
  readonly images?: readonly SpotifyImage[];
  readonly release_date?: string;
}

export interface SpotifyTrackObject {
  readonly id: string | null;
  readonly name: string;
  readonly type?: string;
  readonly is_local?: boolean;
  readonly duration_ms: number;
  readonly track_number?: number;
  readonly disc_number?: number;
  readonly artists?: readonly SpotifyArtistObject[];
  readonly album?: SpotifyAlbumObject;
  readonly external_ids?: { isrc?: string };
}

export interface SpotifyPlaylistItem {
  readonly track: SpotifyTrackObject | null;
}

export interface SpotifyPage<T> {
  readonly items: readonly T[];
  readonly next: string | null;
  readonly total?: number;
}

export interface SpotifyPlaylistObject {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly external_urls?: { spotify?: string };
  readonly tracks?: { total?: number };
}

export interface SpotifyPlaylistSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly trackCount: number;
}

/** A playlist row the mapper could not turn into a `MusicTrack`. */
export interface SkippedPlaylistItem {
  readonly reason: SkippedItemReason;
  readonly title?: string;
}

export interface PlaylistTracksResult {
  readonly tracks: readonly MusicTrack[];
  readonly skipped: readonly SkippedPlaylistItem[];
}

/** One page of playlist items, for callers that must not walk the whole list. */
export interface PlaylistTracksPage extends PlaylistTracksResult {
  /** Total items in the playlist, not in this page. */
  readonly total: number;
  readonly hasNext: boolean;
}

export interface PlaylistPageOptions {
  readonly limit?: number;
  readonly offset?: number;
}
