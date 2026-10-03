import {
  DEFAULT_OUTPUT_TEMPLATE,
  DEFAULT_PATH_SEGMENT_MAX_LENGTH,
  FALLBACK_PATH_SEGMENT,
  PATH_PLACEHOLDER_PATTERN,
  UNSAFE_PATH_CHARS_PATTERN,
  WINDOWS_RESERVED_NAMES,
} from './dj-music.consts';
import type { TrackPathContext } from './track.types';

const LAST_CONTROL_CODE_POINT = 0x1f;
const DELETE_CODE_POINT = 0x7f;
const TRAILING_DOTS_OR_SPACES_PATTERN = /[. ]+$/;

const stripControlChars = (value: string): string =>
  [...value]
    .filter(char => {
      const code = char.codePointAt(0) ?? 0;
      return code > LAST_CONTROL_CODE_POINT && code !== DELETE_CODE_POINT;
    })
    .join('');
const WHITESPACE_PATTERN = /\s+/g;
const TRACK_NUMBER_PAD_LENGTH = 2;

/**
 * Makes one path component safe on every filesystem the library might land on.
 * exFAT and SMB shares are the binding constraint for a DJ library on a USB
 * stick, so the Windows rules apply even when running on macOS.
 */
export const sanitizePathSegment = (
  value: string,
  maxLength: number = DEFAULT_PATH_SEGMENT_MAX_LENGTH,
): string => {
  const cleaned = stripControlChars(value)
    .replace(UNSAFE_PATH_CHARS_PATTERN, ' ')
    .replace(WHITESPACE_PATTERN, ' ')
    .trim()
    .slice(0, maxLength)
    .replace(TRAILING_DOTS_OR_SPACES_PATTERN, '')
    .trim();

  if (!cleaned) {
    return FALLBACK_PATH_SEGMENT;
  }
  if (
    (WINDOWS_RESERVED_NAMES as readonly string[]).includes(
      cleaned.toLowerCase(),
    )
  ) {
    return `_${cleaned}`;
  }
  return cleaned;
};

const buildPlaceholderValues = (
  context: TrackPathContext,
): Record<string, string> => {
  const { track, playlist } = context;
  return {
    playlist: playlist ?? '',
    artist: track.artists[0] ?? '',
    artists: track.artists.join(', '),
    album: track.album ?? '',
    'album-artist': track.albumArtist ?? track.artists[0] ?? '',
    title: track.title,
    'track-number':
      track.trackNumber === undefined
        ? ''
        : String(track.trackNumber).padStart(TRACK_NUMBER_PAD_LENGTH, '0'),
    year: track.releaseYear === undefined ? '' : String(track.releaseYear),
  };
};

/**
 * Renders an output path from a `{placeholder}` template. Values are sanitised
 * before substitution so a track titled `AC/DC` cannot invent a directory
 * level; `/` in the template itself still separates directories.
 */
export const formatTrackPath = (
  context: TrackPathContext,
  template: string = DEFAULT_OUTPUT_TEMPLATE,
): string => {
  const values = buildPlaceholderValues(context);

  const substituted = template.replace(
    PATH_PLACEHOLDER_PATTERN,
    (_match, key: string) => {
      const value = values[key];
      return value ? sanitizePathSegment(value) : '';
    },
  );

  // An unset placeholder collapses its whole segment away rather than leaving
  // an `untitled` directory behind, so `{playlist}/{title}` with no playlist
  // renders as just the filename.
  const path = substituted
    .split('/')
    .filter(segment => segment.trim() !== '')
    .map(segment => sanitizePathSegment(segment))
    .join('/');

  const extension = context.extension;
  return extension ? `${path}.${extension.replace(/^\./, '')}` : path;
};
