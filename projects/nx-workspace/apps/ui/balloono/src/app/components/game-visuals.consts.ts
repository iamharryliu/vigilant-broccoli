import { Bomb, Droplets, Footprints, LucideIcon } from 'lucide-react';
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

// Lucide has no balloon icon; Bomb reads as a knotted balloon at tile size.
export const POWER_UP_ICONS: Record<PowerUpType, LucideIcon> = {
  [POWER_UP.BALLOON]: Bomb,
  [POWER_UP.RANGE]: Droplets,
  [POWER_UP.SPEED]: Footprints,
};
