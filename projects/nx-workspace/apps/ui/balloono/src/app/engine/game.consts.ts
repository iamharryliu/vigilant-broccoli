export const ARENA_SIZES = {
  SMALL: { columns: 13, rows: 11 },
  MEDIUM: { columns: 15, rows: 13 },
  LARGE: { columns: 17, rows: 15 },
} as const;

export const MATCH_EVENT_HISTORY_TICKS = 40;
export const MATCH_EVENT = {
  POP: 'pop',
  PICKUP: 'pickup',
  SPLASH: 'splash',
} as const;
export const MAX_PLAYERS = 8;

export const TICK_MS = 50;
export const TICKS_PER_SECOND = 1000 / TICK_MS;

export const BALLOON_FUSE_TICKS = 50;
export const SPLASH_TICKS = 10;
export const SUDDEN_DEATH_TICK = 120 * TICKS_PER_SECOND;
export const SUDDEN_DEATH_INTERVAL_TICKS = 8;
export const SUDDEN_DEATH_WARNING_TICKS = 2 * TICKS_PER_SECOND;

// Half the avatar's width in tiles. Under 0.5 so a player can slide past a
// corner without being pixel-perfect.
export const PLAYER_HALF_SIZE = 0.4;
export const POSITION_EPSILON = 1e-6;

export const BASE_SPEED = 0.16;
export const SPEED_STEP = 0.03;
export const MAX_SPEED_LEVEL = 4;
export const STARTING_BALLOONS = 1;
export const MAX_BALLOONS = 8;
export const STARTING_RANGE = 1;
export const MAX_RANGE = 8;

export const CRATE_DENSITY = 0.7;
export const POWER_UP_CHANCE = 0.4;

export const CELL = {
  FLOOR: 0,
  WALL: 1,
  CRATE: 2,
} as const;

export const DIRECTION = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
} as const;

export const DIRECTION_VECTORS = {
  [DIRECTION.UP]: { x: 0, y: -1 },
  [DIRECTION.DOWN]: { x: 0, y: 1 },
  [DIRECTION.LEFT]: { x: -1, y: 0 },
  [DIRECTION.RIGHT]: { x: 1, y: 0 },
} as const;

export const OPPOSITE_DIRECTION = {
  [DIRECTION.UP]: DIRECTION.DOWN,
  [DIRECTION.DOWN]: DIRECTION.UP,
  [DIRECTION.LEFT]: DIRECTION.RIGHT,
  [DIRECTION.RIGHT]: DIRECTION.LEFT,
} as const;

export const DIRECTIONS = Object.values(DIRECTION);

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;

export const DIFFICULTIES = Object.values(DIFFICULTY);

export const POWER_UP = {
  BALLOON: 'balloon',
  RANGE: 'range',
  SPEED: 'speed',
} as const;

export const POWER_UP_TYPES = Object.values(POWER_UP);

export const MATCH_STATUS = {
  PLAYING: 'playing',
  OVER: 'over',
} as const;

export const NO_INPUT = { direction: null, placeBalloon: false } as const;
