import {
  CUP_COUNT,
  CUP_SWAP_COUNT_MAX,
  CUP_SWAP_COUNT_MIN,
  CUP_TIMING,
  GAME_TYPE,
} from '../consts/game.consts';
import { Rng, randomInt } from './random';
import { CupRound } from './types';

const SWAP_UNIT_MS = CUP_TIMING.SWAP_MS + CUP_TIMING.SWAP_PAUSE_MS;
export const CUP_SHUFFLE_START_MS =
  CUP_TIMING.SHOW_BALL_MS + CUP_TIMING.COVER_MS;

const pickSwap = (
  rng: Rng,
  previous: readonly [number, number] | undefined,
): [number, number] => {
  for (;;) {
    const a = randomInt(rng, 0, CUP_COUNT - 1);
    const b = randomInt(rng, 0, CUP_COUNT - 1);
    if (a === b) continue;
    const swap: [number, number] = a < b ? [a, b] : [b, a];
    if (previous && previous[0] === swap[0] && previous[1] === swap[1])
      continue;
    return swap;
  }
};

export const buildCupRound = (id: number, rng: Rng): CupRound => {
  const ballCup = randomInt(rng, 0, CUP_COUNT - 1);
  const swapCount = randomInt(rng, CUP_SWAP_COUNT_MIN, CUP_SWAP_COUNT_MAX);
  const swaps: [number, number][] = [];
  for (let i = 0; i < swapCount; i++) {
    swaps.push(pickSwap(rng, swaps[i - 1]));
  }

  // Cups keep their identity; a swap exchanges the slots two cups occupy.
  const layouts: number[][] = [Array.from({ length: CUP_COUNT }, (_, i) => i)];
  for (const [slotA, slotB] of swaps) {
    const next = [...layouts[layouts.length - 1]];
    const cupA = next.indexOf(slotA);
    const cupB = next.indexOf(slotB);
    next[cupA] = slotB;
    next[cupB] = slotA;
    layouts.push(next);
  }

  return {
    id,
    type: GAME_TYPE.CUP_AND_BALL,
    promptMs:
      CUP_SHUFFLE_START_MS + swapCount * SWAP_UNIT_MS + CUP_TIMING.SETTLE_MS,
    ballCup,
    swaps,
    layouts,
    answerSlot: layouts[layouts.length - 1][ballCup],
  };
};

export const getCupStep = (round: CupRound, promptElapsedMs: number) => {
  if (promptElapsedMs < CUP_SHUFFLE_START_MS) return 0;
  const completed =
    Math.floor((promptElapsedMs - CUP_SHUFFLE_START_MS) / SWAP_UNIT_MS) + 1;
  return Math.min(round.swaps.length, completed);
};

export const isCupSwapMoving = (round: CupRound, promptElapsedMs: number) => {
  if (promptElapsedMs < CUP_SHUFFLE_START_MS) return false;
  const sinceStart = promptElapsedMs - CUP_SHUFFLE_START_MS;
  const step = Math.floor(sinceStart / SWAP_UNIT_MS);
  return (
    step < round.swaps.length && sinceStart % SWAP_UNIT_MS < CUP_TIMING.SWAP_MS
  );
};
