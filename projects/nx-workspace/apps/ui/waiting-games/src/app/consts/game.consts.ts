export const GAME_TYPE = {
  CUP_AND_BALL: 'cup-and-ball',
  MULTIPLE_CHOICE: 'multiple-choice',
  TRUE_FALSE: 'true-false',
  ESTIMATION: 'estimation',
} as const;

export type GameType = (typeof GAME_TYPE)[keyof typeof GAME_TYPE];

export const PHASE = {
  PROMPT: 'prompt',
  THINKING: 'thinking',
  REVEAL: 'reveal',
  BREAK: 'break',
} as const;

export type Phase = (typeof PHASE)[keyof typeof PHASE];

export const PHASE_ORDER: readonly Phase[] = [
  PHASE.PROMPT,
  PHASE.THINKING,
  PHASE.REVEAL,
  PHASE.BREAK,
];

export const MS_PER_SECOND = 1000;
export const TICK_INTERVAL_MS = 80;
// A throttled or frozen timer must not fast-forward the round when it wakes.
export const MAX_TICK_DELTA_MS = 400;

export const CUP_COUNT = 3;
export const CUP_SWAP_COUNT_MIN = 5;
export const CUP_SWAP_COUNT_MAX = 7;
export const CUP_TIMING = {
  SHOW_BALL_MS: 2600,
  COVER_MS: 700,
  SWAP_MS: 700,
  SWAP_PAUSE_MS: 120,
  SETTLE_MS: 500,
} as const;

export const MULTIPLE_CHOICE_PROMPT_MS = {
  BASE: 4000,
  PER_WORD: 180,
  MIN: 5000,
  MAX: 9000,
} as const;
export const MULTIPLE_CHOICE_OPTION_STAGGER_MS = 350;

export const TRUE_FALSE_PROMPT_MS = {
  BASE: 3000,
  PER_WORD: 250,
  MIN: 4000,
  MAX: 7000,
} as const;

export const ESTIMATION = {
  PROMPT_BASE_MS: 4000,
  PROMPT_PER_OBJECT_MS: 60,
  PROMPT_MAX_MS: 6500,
  TARGET_MIN: 7,
  TARGET_MAX: 24,
  DISTRACTOR_MIN: 3,
  DISTRACTOR_MAX: 9,
  DISTRACTOR_CHANCE: 0.35,
  MARGIN: 9,
  ASPECT: 4 / 3,
  PLACEMENT_ATTEMPTS: 60,
  SPACING_FACTOR: 0.72,
  SPACING_RELAX: 0.9,
  COUNT_STAGGER_MAX_MS: 140,
  COUNT_SHARE_OF_REVEAL: 0.6,
} as const;

export const SLOT_NAME = ['LEFT', 'MIDDLE', 'RIGHT'] as const;
export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;
