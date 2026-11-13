'use client';

import { useEffect, useRef, useState } from 'react';

type RankedItem = { id: number; rank: number };

/**
 * Tracks rank deltas between successive orderings of the same items so the
 * leaderboard can flash up/down indicators. When `resetKey` changes (e.g. the
 * sort key or period was toggled) the baseline is re-seeded without emitting
 * changes, avoiding a burst of bogus arrows on a full reshuffle.
 */
export function useRankTracking(
  rankedItems: RankedItem[],
  {
    durationMs,
    resetKey,
  }: {
    durationMs: number;
    resetKey?: unknown;
  },
): Map<number, number> {
  const [rankChanges, setRankChanges] = useState<Map<number, number>>(
    new Map(),
  );
  const previousRanksRef = useRef<Map<number, number>>(new Map());
  const hasInitializedRef = useRef(false);
  const resetKeyRef = useRef(resetKey);

  useEffect(() => {
    const currentRanks = new Map(rankedItems.map(item => [item.id, item.rank]));
    const previousRanks = new Map(previousRanksRef.current);
    const resetKeyChanged = resetKeyRef.current !== resetKey;
    resetKeyRef.current = resetKey;

    if (!hasInitializedRef.current || resetKeyChanged) {
      previousRanksRef.current = currentRanks;
      hasInitializedRef.current = true;
      setRankChanges(new Map());
      return;
    }

    setRankChanges(previousRankChanges => {
      const nextRankChanges = new Map(previousRankChanges);
      for (const [id, currentRank] of currentRanks.entries()) {
        const previousRank = previousRanks.get(id);
        if (!previousRank) continue;
        const delta = previousRank - currentRank;
        if (delta !== 0) {
          nextRankChanges.set(id, delta);
        }
      }

      for (const id of Array.from(nextRankChanges.keys())) {
        if (!currentRanks.has(id)) {
          nextRankChanges.delete(id);
        }
      }

      return nextRankChanges;
    });

    previousRanksRef.current = currentRanks;
  }, [rankedItems, resetKey]);

  useEffect(() => {
    if (rankChanges.size === 0) return;

    const timeoutId = window.setTimeout(() => {
      setRankChanges(new Map());
    }, durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [rankChanges, durationMs]);

  return rankChanges;
}
