import {
  PHASE,
  PHASE_ORDER,
  Phase,
  MS_PER_SECOND,
} from '../consts/game.consts';
import { Settings } from '../consts/settings.consts';
import { Round } from './types';

export type PlayerState = {
  round: Round;
  phase: Phase;
  phaseDurationMs: number;
  elapsedMs: number;
};

export type PlayerDeps = {
  nextRound: () => Round;
  getSettings: () => Settings;
};

const getPhaseDurationMs = (
  phase: Phase,
  round: Round,
  settings: Settings,
): number => {
  switch (phase) {
    case PHASE.PROMPT:
      return round.promptMs;
    case PHASE.THINKING:
      return settings.thinkingSeconds * MS_PER_SECOND;
    case PHASE.REVEAL:
      return settings.revealSeconds * MS_PER_SECOND;
    default:
      return settings.breakSeconds * MS_PER_SECOND;
  }
};

export const startRound = (deps: PlayerDeps): PlayerState => {
  const round = deps.nextRound();
  return {
    round,
    phase: PHASE.PROMPT,
    phaseDurationMs: getPhaseDurationMs(
      PHASE.PROMPT,
      round,
      deps.getSettings(),
    ),
    elapsedMs: 0,
  };
};

const startNextPhase = (state: PlayerState, deps: PlayerDeps): PlayerState => {
  const nextIndex = PHASE_ORDER.indexOf(state.phase) + 1;
  if (nextIndex >= PHASE_ORDER.length) return startRound(deps);
  const phase = PHASE_ORDER[nextIndex];
  return {
    round: state.round,
    phase,
    phaseDurationMs: getPhaseDurationMs(phase, state.round, deps.getSettings()),
    elapsedMs: 0,
  };
};

/**
 * A phase's length is fixed when it begins, so a settings change never
 * stretches or shrinks the phase already on screen; it applies from the next one.
 */
export const advance = (
  state: PlayerState,
  deltaMs: number,
  deps: PlayerDeps,
): PlayerState => {
  let current = state;
  let remainingDelta = deltaMs;
  while (current.elapsedMs + remainingDelta >= current.phaseDurationMs) {
    remainingDelta -= current.phaseDurationMs - current.elapsedMs;
    current = startNextPhase(current, deps);
  }
  return { ...current, elapsedMs: current.elapsedMs + remainingDelta };
};

export const skipRound = startRound;
