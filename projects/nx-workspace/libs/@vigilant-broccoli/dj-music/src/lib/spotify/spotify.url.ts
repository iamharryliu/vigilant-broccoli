import { SPOTIFY_REF_TYPE } from './spotify.consts';
import type { SpotifyRef, SpotifyRefType } from './spotify.types';

const REF_TYPES = Object.values(SPOTIFY_REF_TYPE) as readonly string[];

// `open.spotify.com` inserts a locale segment for some regions
// (`/intl-ja/track/...`), which a naive path split would read as the type.
const URL_PATTERN =
  /open\.spotify\.com\/(?:intl-[a-z-]+\/)?([a-z]+)\/([A-Za-z0-9]+)/i;
const URI_PATTERN = /^spotify:([a-z]+):([A-Za-z0-9]+)$/i;

const toRef = (type: string, id: string): SpotifyRef | null =>
  REF_TYPES.includes(type.toLowerCase())
    ? { type: type.toLowerCase() as SpotifyRefType, id }
    : null;

/**
 * Parses a Spotify share URL or URI into its type and id. Ids are accepted as
 * any base62 string rather than validated against the current 22-character
 * format — the API is the authority on whether an id resolves.
 */
export const parseSpotifyRef = (value: string): SpotifyRef | null => {
  const trimmed = value.trim();

  const uriMatch = trimmed.match(URI_PATTERN);
  if (uriMatch?.[1] && uriMatch[2]) {
    return toRef(uriMatch[1], uriMatch[2]);
  }

  const urlMatch = trimmed.match(URL_PATTERN);
  if (urlMatch?.[1] && urlMatch[2]) {
    return toRef(urlMatch[1], urlMatch[2]);
  }

  return null;
};

/** Narrowing helper for callers that require one specific kind of ref. */
export const parseSpotifyRefOfType = (
  value: string,
  type: SpotifyRefType,
): string | null => {
  const ref = parseSpotifyRef(value);
  return ref?.type === type ? ref.id : null;
};
