/**
 * Bracketed segments matching these are upload furniture, not part of the
 * recording's identity, so they are removed before comparison. Version markers
 * (Radio Edit, Extended Mix, Acoustic) are deliberately absent — for DJ use
 * those distinguish two genuinely different recordings and must survive.
 */
export const NOISE_TAGS = [
  'official video',
  'official music video',
  'official audio',
  'official visualizer',
  'official lyric video',
  'music video',
  'lyric video',
  'lyrics',
  'visualizer',
  'audio',
  'hd',
  'hq',
  '4k',
  'full song',
  'free download',
  'out now',
  'mv',
  'pv',
] as const;

/** Matches `Remastered`, `2011 Remaster`, `Remastered 2011`, etc. */
export const REMASTER_PATTERN = /^(\d{4}\s+)?remaster(ed)?(\s+\d{4})?$/;

/**
 * Markers that make a recording a different performance. A mismatch between
 * target and candidate on any of these is penalised rather than ignored —
 * picking up a live or sped-up cut for a studio track is the dominant
 * false-positive in query-then-rank matching.
 */
export const VERSION_KEYWORDS = [
  'live',
  'remix',
  'cover',
  'karaoke',
  'instrumental',
  'acapella',
  'acoustic',
  'demo',
  'sped up',
  'slowed',
  'nightcore',
  'reverb',
  'mashup',
  'bootleg',
  'extended',
  'radio edit',
  'club mix',
  'vip mix',
] as const;

/** Channel suffixes that signal a rights-holder upload rather than a reupload. */
export const OFFICIAL_CHANNEL_MARKERS = ['- topic', 'vevo'] as const;

export const WINDOWS_RESERVED_NAMES = [
  'con',
  'prn',
  'aux',
  'nul',
  'com1',
  'com2',
  'com3',
  'com4',
  'com5',
  'com6',
  'com7',
  'com8',
  'com9',
  'lpt1',
  'lpt2',
  'lpt3',
  'lpt4',
  'lpt5',
  'lpt6',
  'lpt7',
  'lpt8',
  'lpt9',
] as const;

export const DEFAULT_MATCH_WEIGHTS = {
  title: 0.45,
  artist: 0.35,
  duration: 0.2,
} as const;

export const DEFAULT_MATCH_OPTIONS = {
  /** Candidates within this many seconds of the target score a full duration point. */
  durationToleranceSeconds: 7,
  /** Beyond this, the candidate is a different recording (album rip, mix, edit). */
  durationHardLimitSeconds: 45,
  /** Deduction per version keyword present on one side only. */
  versionMismatchPenalty: 0.22,
  maxVersionMismatchPenalty: 0.5,
  officialChannelBonus: 0.06,
  /** Below this composite score a candidate is not worth downloading. */
  minimumScore: 0.55,
  weights: DEFAULT_MATCH_WEIGHTS,
} as const;

export const PATH_PLACEHOLDER_PATTERN = /\{([a-z-]+)\}/g;
export const UNSAFE_PATH_CHARS_PATTERN = /[/\\:*?"<>|]/g;
export const DEFAULT_PATH_SEGMENT_MAX_LENGTH = 120;
export const FALLBACK_PATH_SEGMENT = 'untitled';
export const DEFAULT_OUTPUT_TEMPLATE = '{playlist}/{artist} - {title}';
