/** A track as described by the Spotify Web API — the matching target. */
export interface MusicTrack {
  readonly id: string;
  readonly title: string;
  readonly artists: readonly string[];
  readonly album?: string;
  readonly albumArtist?: string;
  readonly durationMs: number;
  readonly trackNumber?: number;
  readonly discNumber?: number;
  readonly releaseYear?: number;
  readonly isrc?: string;
  readonly coverUrl?: string;
}

/** A search result being considered as the source audio for a `MusicTrack`. */
export interface SourceCandidate {
  readonly id: string;
  readonly title: string;
  /** Channel or uploader name, e.g. `Some Artist - Topic`. */
  readonly uploader?: string;
  readonly durationMs: number;
  readonly url: string;
  /** Set when the provider reports an explicit artist field of its own. */
  readonly artists?: readonly string[];
}

export interface MatchWeights {
  readonly title: number;
  readonly artist: number;
  readonly duration: number;
}

export interface MatchOptions {
  readonly durationToleranceSeconds: number;
  readonly durationHardLimitSeconds: number;
  readonly versionMismatchPenalty: number;
  readonly maxVersionMismatchPenalty: number;
  readonly officialChannelBonus: number;
  readonly minimumScore: number;
  readonly weights: MatchWeights;
}

export interface ScoreBreakdown {
  readonly title: number;
  readonly artist: number;
  readonly duration: number;
  readonly versionPenalty: number;
  readonly officialBonus: number;
}

export interface CandidateScore {
  readonly candidate: SourceCandidate;
  readonly score: number;
  readonly breakdown: ScoreBreakdown;
  /** Populated when the candidate was disqualified outright; `score` is then 0. */
  readonly rejectedReason?: string;
}

export interface PlaylistRef {
  readonly name: string;
  readonly url: string;
}

export interface TrackPathContext {
  readonly track: MusicTrack;
  readonly playlist?: string;
  readonly extension?: string;
}
