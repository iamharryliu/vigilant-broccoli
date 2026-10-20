import { useCallback, useEffect, useRef, useState } from 'react';
import { saveMatchResult } from '../../lib/stats';
import { MATCH_STATUS } from '../engine/game.consts';
import { MatchState } from '../engine/game.types';
import { buildMatchResult } from '../engine/results';
import { useSession } from './useSession';

const PAGEHIDE_EVENT = 'pagehide';

// Honor system: each signed-in client writes its own row from the state it
// sees. Guests, spectators and signed-out players write nothing.
export function useMatchStats(
  room: string,
  userId: string,
  match: MatchState | null,
) {
  const session = useSession();
  const [saveFailed, setSaveFailed] = useState(false);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const matchRef = useRef(match);
  matchRef.current = match;
  const recordedRef = useRef(new Set<string>());

  const record = useCallback(
    (state: MatchState | null) => {
      const current = sessionRef.current;
      if (!current || !state || recordedRef.current.has(state.id)) return;
      const result = buildMatchResult(room, state, userId);
      if (!result) return;
      recordedRef.current.add(state.id);
      saveMatchResult(current.access_token, current.user.id, result).catch(() =>
        setSaveFailed(true),
      );
    },
    [room, userId],
  );

  useEffect(() => {
    if (match?.status === MATCH_STATUS.OVER) record(match);
  }, [match, record]);

  // Leaving (or closing the tab) mid-match records a loss from the last state.
  useEffect(() => {
    const recordLeft = () => {
      if (matchRef.current?.status === MATCH_STATUS.PLAYING) {
        record(matchRef.current);
      }
    };
    window.addEventListener(PAGEHIDE_EVENT, recordLeft);
    return () => {
      window.removeEventListener(PAGEHIDE_EVENT, recordLeft);
      recordLeft();
    };
  }, [record]);

  return { saveFailed };
}
