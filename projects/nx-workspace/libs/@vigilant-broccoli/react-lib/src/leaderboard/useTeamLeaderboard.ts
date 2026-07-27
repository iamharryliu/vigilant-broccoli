'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LeaderBoardPeriod,
  TEAM_PERIODS,
  TEAM_SORT_KEYS,
  TeamLeaderboardRow,
  TeamSortKey,
} from './leaderboard.types';
import {
  DEFAULT_CHANGE_ANIMATION_MS,
  DEFAULT_RANK_CHANGE_DURATION_MS,
  DEFAULT_REFRESH_INTERVAL_MS,
} from './leaderboard.consts';
import { useRankTracking } from './useRankTracking';

export type TeamLeaderboardFetchParams = {
  period: LeaderBoardPeriod;
  sortKey: TeamSortKey;
};

type UnrankedTeamRow = Omit<TeamLeaderboardRow, 'rank'>;

type TeamLeaderboardFilters = {
  period: LeaderBoardPeriod;
  sortKey: TeamSortKey;
};

export type UseTeamLeaderboardOptions = {
  /** Fetches the raw (unranked) team rows for the current period. */
  fetchTeams: (
    params: TeamLeaderboardFetchParams,
  ) => Promise<UnrankedTeamRow[]>;
  refreshIntervalMs?: number;
  rankChangeDurationMs?: number;
  changeAnimationMs?: number;
  persistKey?: string | null;
  initialFilters?: Partial<TeamLeaderboardFilters>;
};

function teamHasChanged(
  oldRow: UnrankedTeamRow,
  newRow: UnrankedTeamRow,
): boolean {
  return (
    oldRow.totalCalls !== newRow.totalCalls ||
    oldRow.averageScore !== newRow.averageScore
  );
}

function loadPersistedFilters(
  persistKey: string | null,
): Partial<TeamLeaderboardFilters> {
  if (!persistKey || typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(persistKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<TeamLeaderboardFilters>;
    return {
      period: TEAM_PERIODS.includes(parsed.period as LeaderBoardPeriod)
        ? (parsed.period as LeaderBoardPeriod)
        : undefined,
      sortKey: TEAM_SORT_KEYS.includes(parsed.sortKey as TeamSortKey)
        ? (parsed.sortKey as TeamSortKey)
        : undefined,
    };
  } catch {
    return {};
  }
}

export function useTeamLeaderboard({
  fetchTeams,
  refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS,
  rankChangeDurationMs = DEFAULT_RANK_CHANGE_DURATION_MS,
  changeAnimationMs = DEFAULT_CHANGE_ANIMATION_MS,
  persistKey = null,
  initialFilters,
}: UseTeamLeaderboardOptions) {
  const persisted = useMemo(
    () => loadPersistedFilters(persistKey),
    [persistKey],
  );

  const [period, setPeriod] = useState<LeaderBoardPeriod>(
    initialFilters?.period ?? persisted.period ?? 'week',
  );
  const [sortKey, setSortKey] = useState<TeamSortKey>(
    initialFilters?.sortKey ?? persisted.sortKey ?? 'totalCalls',
  );

  const [rows, setRows] = useState<UnrankedTeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changedTeamIds, setChangedTeamIds] = useState<Set<number>>(new Set());

  const hasLoadedRef = useRef(false);
  const fetchRef = useRef(fetchTeams);
  fetchRef.current = fetchTeams;

  useEffect(() => {
    if (!persistKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        persistKey,
        JSON.stringify({ period, sortKey } satisfies TeamLeaderboardFilters),
      );
    } catch {
      // Ignore storage errors.
    }
  }, [persistKey, period, sortKey]);

  const applyFetchedTeams = useCallback(
    (fetched: UnrankedTeamRow[]) => {
      setRows(prevRows => {
        if (prevRows.length !== fetched.length) {
          setChangedTeamIds(new Set());
          return fetched;
        }

        const oldRowMap = new Map(prevRows.map(row => [row.id, row]));
        const changed = new Set<number>();
        for (const newRow of fetched) {
          const oldRow = oldRowMap.get(newRow.id);
          if (!oldRow || teamHasChanged(oldRow, newRow)) {
            changed.add(newRow.id);
          }
        }

        if (changed.size === 0) return prevRows;

        setChangedTeamIds(changed);
        window.setTimeout(
          () => setChangedTeamIds(new Set()),
          changeAnimationMs,
        );
        return fetched;
      });
    },
    [changeAnimationMs],
  );

  const load = useCallback(
    async (isRefresh: boolean) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const fetched = await fetchRef.current({ period, sortKey });
        applyFetchedTeams(fetched);
      } finally {
        hasLoadedRef.current = true;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period, sortKey, applyFetchedTeams],
  );

  useEffect(() => {
    load(hasLoadedRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  useEffect(() => {
    if (!refreshIntervalMs) return;
    const interval = window.setInterval(() => {
      load(true);
    }, refreshIntervalMs);
    return () => window.clearInterval(interval);
  }, [refreshIntervalMs, load]);

  const sortedRows = useMemo<TeamLeaderboardRow[]>(() => {
    return rows
      .slice()
      .sort((a, b) => b[sortKey] - a[sortKey])
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }, [rows, sortKey]);

  const rankChanges = useRankTracking(sortedRows, {
    durationMs: rankChangeDurationMs,
    resetKey: `${period}|${sortKey}`,
  });

  return {
    period,
    setPeriod,
    sortKey,
    setSortKey,
    loading,
    refreshing,
    sortedRows,
    changedTeamIds,
    rankChanges,
    rankChangeDurationMs,
    refresh: () => load(true),
  };
}
