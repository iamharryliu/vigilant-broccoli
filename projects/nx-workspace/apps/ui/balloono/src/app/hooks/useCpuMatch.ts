import { useCallback, useEffect, useState } from 'react';
import { BotMemory } from '../engine/cpu';
import { MATCH_STATUS, TICK_MS } from '../engine/game.consts';
import { Contender, MatchState } from '../engine/game.types';
import { createMatch } from '../engine/match';
import { runTick } from '../engine/runner';
import { Controls } from './useControls';

export function useCpuMatch(
  contenders: Contender[] | null,
  playerId: string,
  controls: Controls,
  localPlayer?: { id: string; controls: Controls },
) {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [wins, setWins] = useState<Record<string, number>>({});
  const [round, setRound] = useState(0);

  const restart = useCallback(() => setRound(current => current + 1), []);

  useEffect(() => {
    if (!contenders) {
      setMatch(null);
      return;
    }
    let state = createMatch(contenders);
    const botMemory: BotMemory = new Map();
    setMatch(state);
    const interval = window.setInterval(() => {
      state = runTick(
        state,
        {
          [playerId]: controls.takeInput(),
          ...(localPlayer && {
            [localPlayer.id]: localPlayer.controls.takeInput(),
          }),
        },
        botMemory,
      );
      setMatch(state);
      if (state.status !== MATCH_STATUS.OVER) return;
      window.clearInterval(interval);
      const { winnerId } = state;
      if (winnerId) {
        setWins(current => ({
          ...current,
          [winnerId]: (current[winnerId] ?? 0) + 1,
        }));
      }
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [contenders, playerId, controls, localPlayer, round]);

  return { match, wins, restart };
}
