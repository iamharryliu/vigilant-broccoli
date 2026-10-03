import {
  NOISE_TAGS,
  REMASTER_PATTERN,
  VERSION_KEYWORDS,
} from './dj-music.consts';

const DIACRITIC_PATTERN = /[̀-ͯ]/g;
const BRACKETED_SEGMENT_PATTERN = /[([]([^)\]]*)[)\]]/g;
const FEATURED_BRACKETED_PATTERN =
  /[([]\s*(?:feat|ft|featuring|with)\.?\s+([^)\]]+)[)\]]/gi;
const FEATURED_TRAILING_PATTERN = /\s+(?:feat|ft|featuring)\.?\s+(.+)$/i;
const FEATURED_ARTIST_SPLIT_PATTERN = /\s*(?:,|&|\sx\s|\sand\s)\s*/i;
const NON_ALPHANUMERIC_PATTERN = /[^a-z0-9\s]/g;
const WHITESPACE_PATTERN = /\s+/g;
const ARTIST_TITLE_SPLIT_PATTERN = /\s+[-–—]\s+/;

export const stripDiacritics = (value: string): string =>
  value.normalize('NFKD').replace(DIACRITIC_PATTERN, '');

const collapseWhitespace = (value: string): string =>
  value.replace(WHITESPACE_PATTERN, ' ').trim();

const isNoiseSegment = (segment: string): boolean => {
  const cleaned = collapseWhitespace(
    stripDiacritics(segment)
      .toLowerCase()
      .replace(NON_ALPHANUMERIC_PATTERN, ' '),
  );
  if (!cleaned) {
    return true;
  }
  return (
    (NOISE_TAGS as readonly string[]).includes(cleaned) ||
    REMASTER_PATTERN.test(cleaned)
  );
};

/**
 * Drops bracketed upload furniture (`(Official Video)`, `[HD]`, `(2011 Remaster)`)
 * while leaving every other bracketed segment intact, so version markers such as
 * `(Extended Mix)` still reach the matcher.
 */
export const removeNoiseTags = (value: string): string =>
  collapseWhitespace(
    value.replace(BRACKETED_SEGMENT_PATTERN, (match, inner: string) =>
      isNoiseSegment(inner) ? ' ' : match,
    ),
  );

/** Splits `Title (feat. A & B)` into its base title and the featured artists. */
export const splitFeaturedArtists = (
  value: string,
): { title: string; featured: string[] } => {
  const featured: string[] = [];

  const withoutBracketed = value.replace(
    FEATURED_BRACKETED_PATTERN,
    (_match, names: string) => {
      featured.push(names);
      return ' ';
    },
  );

  const trailing = withoutBracketed.match(FEATURED_TRAILING_PATTERN);
  const title = trailing
    ? withoutBracketed.replace(FEATURED_TRAILING_PATTERN, '')
    : withoutBracketed;
  if (trailing?.[1]) {
    featured.push(trailing[1]);
  }

  return {
    title: collapseWhitespace(title),
    featured: featured
      .flatMap(group => group.split(FEATURED_ARTIST_SPLIT_PATTERN))
      .map(name => collapseWhitespace(name))
      .filter(Boolean),
  };
};

/**
 * Reduces a title or artist to a comparable form: diacritics folded, upload
 * furniture and featured-artist credits removed, punctuation dropped.
 */
export const normalizeForMatch = (value: string): string => {
  const withoutNoise = removeNoiseTags(stripDiacritics(value).toLowerCase());
  const { title } = splitFeaturedArtists(withoutNoise);
  return collapseWhitespace(
    title.replace(/&/g, ' and ').replace(NON_ALPHANUMERIC_PATTERN, ' '),
  );
};

export const tokenize = (value: string): string[] => {
  const normalized = normalizeForMatch(value);
  return normalized ? normalized.split(' ') : [];
};

/** Splits a `Artist - Title` upload title; `artist` is undefined when absent. */
export const splitArtistTitle = (
  value: string,
): { artist?: string; title: string } => {
  const parts = value.split(ARTIST_TITLE_SPLIT_PATTERN);
  if (parts.length < 2) {
    return { title: collapseWhitespace(value) };
  }
  const [artist, ...rest] = parts;
  return {
    artist: collapseWhitespace(artist),
    title: collapseWhitespace(rest.join(' - ')),
  };
};

/** Version markers present in `value`, matched on whole words only. */
export const extractVersionKeywords = (value: string): Set<string> => {
  const padded = ` ${normalizeForMatch(value)} `;
  return new Set(
    VERSION_KEYWORDS.filter(keyword => padded.includes(` ${keyword} `)),
  );
};
