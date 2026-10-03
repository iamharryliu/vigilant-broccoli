import {
  DEFAULT_MATCH_OPTIONS,
  DEFAULT_MATCH_WEIGHTS,
  OFFICIAL_CHANNEL_MARKERS,
} from './dj-music.consts';
import {
  extractVersionKeywords,
  normalizeForMatch,
  splitArtistTitle,
  splitFeaturedArtists,
} from './normalize';
import { containsAllTokens, stringSimilarity } from './similarity';
import type {
  CandidateScore,
  MatchOptions,
  MusicTrack,
  SourceCandidate,
} from './track.types';

const MS_PER_SECOND = 1000;
const PRIMARY_ARTIST_WEIGHT = 0.8;
const REJECTED_DURATION = 'duration-out-of-range';

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const resolveMatchOptions = (
  overrides?: Partial<MatchOptions>,
): MatchOptions => ({
  ...DEFAULT_MATCH_OPTIONS,
  ...overrides,
  weights: { ...DEFAULT_MATCH_WEIGHTS, ...overrides?.weights },
});

/**
 * Full credit inside the tolerance window, then a linear decay to zero at the
 * hard limit. A candidate past the hard limit is a different recording, not a
 * worse one, so `scoreCandidate` disqualifies it rather than ranking it low.
 */
export const durationScore = (
  targetMs: number,
  candidateMs: number,
  options: MatchOptions,
): number => {
  const deltaSeconds = Math.abs(targetMs - candidateMs) / MS_PER_SECOND;
  if (deltaSeconds <= options.durationToleranceSeconds) {
    return 1;
  }
  if (deltaSeconds >= options.durationHardLimitSeconds) {
    return 0;
  }
  const window =
    options.durationHardLimitSeconds - options.durationToleranceSeconds;
  return clamp01(
    1 - (deltaSeconds - options.durationToleranceSeconds) / window,
  );
};

const scoreOneArtist = (
  artist: string,
  candidateTitle: string,
  candidateArtistText: string,
): number => {
  const normalized = normalizeForMatch(artist);
  if (!normalized) {
    return 0;
  }
  if (containsAllTokens(candidateTitle, normalized)) {
    return 1;
  }
  return stringSimilarity(normalized, candidateArtistText);
};

export const artistScore = (
  track: MusicTrack,
  candidate: SourceCandidate,
): number => {
  const [primary, ...secondary] = track.artists;
  if (!primary) {
    return 0;
  }

  const uploader = (candidate.uploader ?? '').toLowerCase();
  const withoutChannelMarker = OFFICIAL_CHANNEL_MARKERS.reduce(
    (value, marker) => value.split(marker).join(' '),
    uploader,
  );
  const candidateArtistText = normalizeForMatch(
    [withoutChannelMarker, ...(candidate.artists ?? [])].join(' '),
  );
  const candidateTitle = normalizeForMatch(candidate.title);

  const primaryScore = scoreOneArtist(
    primary,
    candidateTitle,
    candidateArtistText,
  );
  if (!secondary.length) {
    return primaryScore;
  }

  const secondaryScore =
    secondary.reduce(
      (total, artist) =>
        total + scoreOneArtist(artist, candidateTitle, candidateArtistText),
      0,
    ) / secondary.length;

  return (
    PRIMARY_ARTIST_WEIGHT * primaryScore +
    (1 - PRIMARY_ARTIST_WEIGHT) * secondaryScore
  );
};

export const titleScore = (
  track: MusicTrack,
  candidate: SourceCandidate,
): number => {
  const target = normalizeForMatch(track.title);
  const wholeTitle = normalizeForMatch(candidate.title);
  // Uploads are `Artist - Title` about as often as they are bare titles, and
  // scoring the artist half against the track title drags a good match down.
  const { title: titlePart } = splitArtistTitle(candidate.title);
  return Math.max(
    stringSimilarity(target, wholeTitle),
    stringSimilarity(target, normalizeForMatch(titlePart)),
  );
};

/**
 * Penalises version markers present on exactly one side. Symmetric on purpose:
 * a live upload for a studio target is as wrong as a studio upload for a live
 * target.
 */
export const versionPenalty = (
  track: MusicTrack,
  candidate: SourceCandidate,
  options: MatchOptions,
): number => {
  const target = extractVersionKeywords(track.title);
  const found = extractVersionKeywords(candidate.title);
  const mismatches = [
    ...[...target].filter(keyword => !found.has(keyword)),
    ...[...found].filter(keyword => !target.has(keyword)),
  ].length;

  return Math.min(
    mismatches * options.versionMismatchPenalty,
    options.maxVersionMismatchPenalty,
  );
};

export const isOfficialUpload = (candidate: SourceCandidate): boolean => {
  const uploader = (candidate.uploader ?? '').toLowerCase();
  return OFFICIAL_CHANNEL_MARKERS.some(marker => uploader.includes(marker));
};

export const scoreCandidate = (
  track: MusicTrack,
  candidate: SourceCandidate,
  overrides?: Partial<MatchOptions>,
): CandidateScore => {
  const options = resolveMatchOptions(overrides);
  const duration = durationScore(
    track.durationMs,
    candidate.durationMs,
    options,
  );
  const emptyBreakdown = {
    title: 0,
    artist: 0,
    duration: 0,
    versionPenalty: 0,
    officialBonus: 0,
  };

  if (duration === 0) {
    return {
      candidate,
      score: 0,
      breakdown: emptyBreakdown,
      rejectedReason: REJECTED_DURATION,
    };
  }

  const title = titleScore(track, candidate);
  const artist = artistScore(track, candidate);
  const penalty = versionPenalty(track, candidate, options);
  const officialBonus = isOfficialUpload(candidate)
    ? options.officialChannelBonus
    : 0;

  const weighted =
    title * options.weights.title +
    artist * options.weights.artist +
    duration * options.weights.duration;

  return {
    candidate,
    score: clamp01(weighted - penalty + officialBonus),
    breakdown: {
      title,
      artist,
      duration,
      versionPenalty: penalty,
      officialBonus,
    },
  };
};

export const rankCandidates = (
  track: MusicTrack,
  candidates: readonly SourceCandidate[],
  overrides?: Partial<MatchOptions>,
): CandidateScore[] =>
  candidates
    .map(candidate => scoreCandidate(track, candidate, overrides))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      // Equal scores: prefer the runtime closest to the Spotify duration.
      return (
        Math.abs(left.candidate.durationMs - track.durationMs) -
        Math.abs(right.candidate.durationMs - track.durationMs)
      );
    });

/** Highest-scoring candidate at or above `minimumScore`, or null. */
export const selectBestMatch = (
  track: MusicTrack,
  candidates: readonly SourceCandidate[],
  overrides?: Partial<MatchOptions>,
): CandidateScore | null => {
  const options = resolveMatchOptions(overrides);
  const best = rankCandidates(track, candidates, overrides).find(
    scored => !scored.rejectedReason && scored.score >= options.minimumScore,
  );
  return best ?? null;
};

/** Search strings to try in order, broadest fidelity first. */
export const buildSearchQueries = (track: MusicTrack): string[] => {
  const [primary] = track.artists;
  const allArtists = track.artists.join(', ');
  const { title: baseTitle } = splitFeaturedArtists(track.title);

  return [
    `${allArtists} - ${track.title}`,
    `${primary ?? ''} - ${track.title}`,
    `${primary ?? ''} - ${baseTitle}`,
  ]
    .map(query => query.trim())
    .filter((query, index, queries) => queries.indexOf(query) === index);
};
