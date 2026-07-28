'use client';

import {
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  LeaderBoardPeriod,
  LeaderBoardUser,
  LeaderboardMetricDef,
  LeaderboardMetrics,
  LeaderboardUserGroup,
} from './leaderboard.types';
import {
  DEFAULT_CHANGE_ANIMATION_MS,
  DEFAULT_ITEMS_PER_PAGE,
  DEFAULT_RANK_CHANGE_DURATION_MS,
  DEFAULT_REFRESH_INTERVAL_MS,
} from './leaderboard.consts';
import { useRankTracking } from './useRankTracking';

export type LeaderboardFetchParams = {
  period: LeaderBoardPeriod;
  sortKey: string;
  selectedGroupId: number | null;
};

type LeaderboardFilters = {
  period: LeaderBoardPeriod;
  sortKey: string;
  selectedGroupId: number | null;
  itemsPerPage: number;
  visibleColumns: string[];
};

export type UseLeaderboardOptions = {
  /** Defines which metrics this leaderboard can sort and display by. */
  metrics: LeaderboardMetricDef[];
  /** Fetches the raw (unranked) users for the current filters. */
  fetchUsers: (params: LeaderboardFetchParams) => Promise<LeaderBoardUser[]>;
  /** Groups shown in the group filter dropdown. */
  userGroups?: LeaderboardUserGroup[];
  /** Client-side group filter; omit when `fetchUsers` already filters server-side. */
  filterUsersByGroup?: (
    users: LeaderBoardUser[],
    groupId: number,
  ) => LeaderBoardUser[];
  /** Id of the signed-in user, used to render the floating "your rank" bar. */
  currentUserId?: number;
  /** Poll interval in ms. `0` disables polling. */
  refreshIntervalMs?: number;
  /** How long rank-change indicators stay visible. */
  rankChangeDurationMs?: number;
  /** How long the value-changed pulse stays on a row. */
  changeAnimationMs?: number;
  /** localStorage key for persisting filters. `null` disables persistence. */
  persistKey?: string | null;
  initialFilters?: Partial<LeaderboardFilters>;
  onUserClick?: (user: LeaderBoardUser) => void;
};

function metricsHaveChanged(
  oldMetrics: LeaderboardMetrics,
  newMetrics: LeaderboardMetrics,
): boolean {
  const keys = new Set([
    ...Object.keys(oldMetrics),
    ...Object.keys(newMetrics),
  ]);
  for (const key of keys) {
    if ((oldMetrics[key] || 0) !== (newMetrics[key] || 0)) return true;
  }
  return false;
}

function parseVisibleColumns(value: unknown, metricKeys: string[]): string[] {
  if (!Array.isArray(value)) return metricKeys;
  const parsed = value.filter(
    (v): v is string => typeof v === 'string' && metricKeys.includes(v),
  );
  return parsed.length > 0 ? parsed : metricKeys;
}

function loadPersistedFilters(
  persistKey: string | null,
  metricKeys: string[],
): Partial<LeaderboardFilters> {
  if (!persistKey || typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(persistKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<LeaderboardFilters>;
    return {
      period: parsed.period,
      sortKey: parsed.sortKey,
      selectedGroupId:
        typeof parsed.selectedGroupId === 'number'
          ? parsed.selectedGroupId
          : null,
      itemsPerPage: parsed.itemsPerPage,
      visibleColumns: parseVisibleColumns(parsed.visibleColumns, metricKeys),
    };
  } catch {
    return {};
  }
}

export function useLeaderboard({
  metrics,
  fetchUsers,
  userGroups = [],
  filterUsersByGroup,
  currentUserId,
  refreshIntervalMs = DEFAULT_REFRESH_INTERVAL_MS,
  rankChangeDurationMs = DEFAULT_RANK_CHANGE_DURATION_MS,
  changeAnimationMs = DEFAULT_CHANGE_ANIMATION_MS,
  persistKey = null,
  initialFilters,
  onUserClick,
}: UseLeaderboardOptions) {
  const metricKeys = useMemo(() => metrics.map(m => m.key), [metrics]);

  const persisted = useMemo(
    () => loadPersistedFilters(persistKey, metricKeys),
    [persistKey, metricKeys],
  );

  const [period, setPeriodState] = useState<LeaderBoardPeriod>(
    initialFilters?.period ?? persisted.period ?? 'week',
  );
  const [sortKey, setSortKeyState] = useState<string>(
    initialFilters?.sortKey ?? persisted.sortKey ?? metricKeys[0],
  );
  const [selectedGroupId, setSelectedGroupIdState] = useState<number | null>(
    initialFilters?.selectedGroupId ?? persisted.selectedGroupId ?? null,
  );
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    initialFilters?.itemsPerPage ??
      persisted.itemsPerPage ??
      DEFAULT_ITEMS_PER_PAGE,
  );
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    initialFilters?.visibleColumns ?? persisted.visibleColumns ?? metricKeys,
  );

  const [users, setUsers] = useState<LeaderBoardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [changedUserIds, setChangedUserIds] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const hasLoadedRef = useRef(false);
  const fetchRef = useRef(fetchUsers);
  fetchRef.current = fetchUsers;

  useEffect(() => {
    if (!persistKey || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        persistKey,
        JSON.stringify({
          period,
          sortKey,
          selectedGroupId,
          itemsPerPage,
          visibleColumns,
        } satisfies LeaderboardFilters),
      );
    } catch {
      // Ignore storage errors.
    }
  }, [
    persistKey,
    period,
    sortKey,
    selectedGroupId,
    itemsPerPage,
    visibleColumns,
  ]);

  const applyFetchedUsers = useCallback(
    (fetched: LeaderBoardUser[]) => {
      setUsers(prevData => {
        if (prevData.length !== fetched.length) {
          setChangedUserIds(new Set());
          return fetched;
        }

        const oldUserMap = new Map(prevData.map(u => [u.id, u]));
        const changed = new Set<number>();
        for (const newUser of fetched) {
          const oldUser = oldUserMap.get(newUser.id);
          if (
            !oldUser ||
            metricsHaveChanged(oldUser.metrics, newUser.metrics)
          ) {
            changed.add(newUser.id);
          }
        }

        if (changed.size === 0) return prevData;

        setChangedUserIds(changed);
        window.setTimeout(
          () => setChangedUserIds(new Set()),
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
        const fetched = await fetchRef.current({
          period,
          sortKey,
          selectedGroupId,
        });
        applyFetchedUsers(fetched);
      } finally {
        hasLoadedRef.current = true;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [period, sortKey, selectedGroupId, applyFetchedUsers],
  );

  useEffect(() => {
    load(hasLoadedRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, selectedGroupId]);

  useEffect(() => {
    if (!refreshIntervalMs) return;
    const interval = window.setInterval(() => {
      load(true);
    }, refreshIntervalMs);
    return () => window.clearInterval(interval);
  }, [refreshIntervalMs, load]);

  const filteredUsers = useMemo(() => {
    if (selectedGroupId === null || !filterUsersByGroup) return users;
    return filterUsersByGroup(users, selectedGroupId);
  }, [users, selectedGroupId, filterUsersByGroup]);

  const sortedUsers = useMemo(() => {
    return filteredUsers
      .slice()
      .sort((a, b) => (b.metrics[sortKey] ?? 0) - (a.metrics[sortKey] ?? 0))
      .map((u, index) => ({ ...u, rank: index + 1 }));
  }, [filteredUsers, sortKey]);

  const rankResetKey = `${period}|${sortKey}|${selectedGroupId}`;
  const rankChanges = useRankTracking(sortedUsers, {
    durationMs: rankChangeDurationMs,
    resetKey: rankResetKey,
  });

  useEffect(() => {
    if (visibleColumns.length === 0) {
      setVisibleColumns([metricKeys[0]]);
      return;
    }
    if (!visibleColumns.includes(sortKey)) {
      setSortKeyState(visibleColumns[0]);
    }
  }, [sortKey, visibleColumns, metricKeys]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(offset, offset + itemsPerPage);

  const currentUser =
    currentUserId != null
      ? (sortedUsers.find(u => u.id === currentUserId) ?? null)
      : null;

  const setPeriod = useCallback((value: LeaderBoardPeriod) => {
    setPeriodState(value);
    setPage(1);
  }, []);

  const setSortKey = useCallback((value: string) => {
    setSortKeyState(value);
    setPage(1);
  }, []);

  const setSelectedGroupId = useCallback((value: number | null) => {
    setSelectedGroupIdState(value);
    setPage(1);
  }, []);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setPage(1);
  }, []);

  const onPageChange = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    setPage(parseInt(e.currentTarget.value, 10));
  }, []);

  const handleUserClick = useCallback(
    (user: LeaderBoardUser) => {
      onUserClick?.(user);
    },
    [onUserClick],
  );

  return {
    metrics,
    period,
    setPeriod,
    sortKey,
    setSortKey,
    visibleColumns,
    setVisibleColumns,
    selectedGroupId,
    setSelectedGroupId,
    itemsPerPage,
    handleItemsPerPageChange,
    userGroups,
    loading,
    refreshing,
    currentUser,
    paginatedUsers,
    page: safePage,
    totalPages,
    hasNextPage: offset + itemsPerPage < sortedUsers.length,
    hasPrevPage: safePage > 1,
    onPageChange,
    handleUserClick,
    changedUserIds,
    rankChanges,
    rankChangeDurationMs,
    refresh: () => load(true),
  };
}
