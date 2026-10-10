import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_TICK_DELTA_MS, TICK_INTERVAL_MS } from '../consts/game.consts';
import { Settings } from '../consts/settings.consts';
import { createRoundGenerator } from '../engine/round-generator';
import {
  PlayerDeps,
  PlayerState,
  advance,
  skipRound,
  startRound,
} from '../engine/player';

export const useWaitingGame = (settings: Settings, running: boolean) => {
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const depsRef = useRef<PlayerDeps | null>(null);
  if (!depsRef.current) {
    depsRef.current = {
      nextRound: createRoundGenerator(),
      getSettings: () => settingsRef.current,
    };
  }
  const deps = depsRef.current;

  const stateRef = useRef<PlayerState | null>(null);
  if (!stateRef.current) stateRef.current = startRound(deps);

  const [state, setState] = useState<PlayerState>(stateRef.current);

  const commit = useCallback((next: PlayerState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min(now - last, MAX_TICK_DELTA_MS);
      last = now;
      commit(advance(stateRef.current as PlayerState, delta, deps));
    }, TICK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [running, commit, deps]);

  const skip = useCallback(() => commit(skipRound(deps)), [commit, deps]);

  return { state, skip };
};
