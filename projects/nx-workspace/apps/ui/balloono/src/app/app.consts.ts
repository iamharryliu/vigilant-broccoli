import { DIFFICULTY } from './engine/game.consts';
import { Difficulty } from './engine/game.types';

export const APP_NAME = 'Balloono';
export const APP_DESCRIPTION =
  'Bomberman-style water balloon battles in your browser: online rooms or CPU opponents.';

export const DIFFICULTY_LABEL_KEY = {
  [DIFFICULTY.EASY]: 'DIFFICULTY.EASY',
  [DIFFICULTY.MEDIUM]: 'DIFFICULTY.MEDIUM',
  [DIFFICULTY.HARD]: 'DIFFICULTY.HARD',
} as const satisfies Record<Difficulty, string>;

const MAX_ROOM_NAME_LENGTH = 24;
const ROOM_NAME_SEPARATOR = '-';

export const normalizeRoomName = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ROOM_NAME_SEPARATOR)
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_ROOM_NAME_LENGTH);

// Online rooms need the Supabase public pair; CPU play works without it, so a
// local `nx serve` with no env still runs.
export const ONLINE_AVAILABLE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
