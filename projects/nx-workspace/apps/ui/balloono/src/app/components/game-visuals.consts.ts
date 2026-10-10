import { POWER_UP } from '../engine/game.consts';
import { PowerUpType } from '../engine/game.types';

export const PLAYER_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#78716c',
];

// Each power-up also gets its own colour so the board stays readable on
// devices without an emoji font.
export const POWER_UP_COLORS: Record<PowerUpType, string> = {
  [POWER_UP.BALLOON]: '#f472b6',
  [POWER_UP.RANGE]: '#38bdf8',
  [POWER_UP.SPEED]: '#a3e635',
};

export const POWER_UP_LABEL_KEY = {
  [POWER_UP.BALLOON]: 'POWER_UP.BALLOON',
  [POWER_UP.RANGE]: 'POWER_UP.RANGE',
  [POWER_UP.SPEED]: 'POWER_UP.SPEED',
} as const satisfies Record<PowerUpType, string>;

export const POWER_UP_GLYPHS: Record<PowerUpType, string> = {
  [POWER_UP.BALLOON]: '🎈',
  [POWER_UP.RANGE]: '💧',
  [POWER_UP.SPEED]: '👟',
};
