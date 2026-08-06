'use client';

import {
  MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UserRow } from './UserRow';
import { BaseLeaderboard } from './BaseLeaderboard';
import { FloatingFollow } from './FloatingFollow';
import { LeaderboardSkeleton } from './LeaderboardSkeleton';
import { LeaderboardCellSkeleton } from './Skeleton';
import { LeaderboardFilterField } from './LeaderboardFilterField';
import {
  LeaderBoardUser,
  LeaderBoardPeriod,
  LeaderboardMetricDef,
  LeaderboardUserGroup,
  ITEMS_PER_PAGE_OPTIONS,
} from './leaderboard.types';
import { LEADERBOARD_TEXT, PERIOD_LABELS } from './leaderboard.consts';
import { Select } from '../components/Select';
import { MultiSelect } from '../components/MultiSelect';
import { Button } from '../components/Button';

type GroupOption = {
  id: number | null;
  name: string;
};

const PERIOD_OPTIONS: LeaderBoardPeriod[] = [
  'day',
  'week',
  'month',
  'lifetime',
];

const ITEMS_PER_PAGE_DISPLAY: Record<string, string> = Object.fromEntries(
  ITEMS_PER_PAGE_OPTIONS.map(n => [String(n), String(n)]),
);

function LeaderboardPagination({
  page,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (e: ReactMouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="flex justify-center items-center gap-2">
      <Button
        variant="outline"
        disabled={!hasPrevPage}
        style={!hasPrevPage ? { opacity: 0 } : undefined}
        aria-hidden={!hasPrevPage}
        aria-label={LEADERBOARD_TEXT.PREVIOUS}
        tabIndex={!hasPrevPage ? -1 : undefined}
        onClick={onPageChange}
        value={page - 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            onClick={onPageChange}
            value={p}
          >
            {p}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        disabled={!hasNextPage}
        style={!hasNextPage ? { opacity: 0 } : undefined}
        aria-hidden={!hasNextPage}
        aria-label={LEADERBOARD_TEXT.NEXT}
        tabIndex={!hasNextPage ? -1 : undefined}
        onClick={onPageChange}
        value={page + 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function FloatingCurrentUserBar({
  currentUser,
  metrics,
  onClick,
  rankChanges,
  visibleColumns,
  rankChangeDurationMs,
  navbarHeight,
  followTopAdjustment,
  floatingFollowInnerClassName,
}: {
  currentUser: LeaderBoardUser | null;
  metrics: LeaderboardMetricDef[];
  onClick: (user: LeaderBoardUser) => void;
  rankChanges: Map<number, number>;
  visibleColumns: string[];
  rankChangeDurationMs?: number;
  navbarHeight?: number;
  followTopAdjustment?: number;
  floatingFollowInnerClassName?: string;
}) {
  if (!currentUser) return null;

  return (
    <FloatingFollow
      active={Boolean(currentUser)}
      targetSelector={`[data-leaderboard-user-row-id="${currentUser.id}"]`}
      navbarHeight={navbarHeight}
      followTopAdjustment={followTopAdjustment}
      innerClassName={floatingFollowInnerClassName}
      rowComponent={UserRow}
      rowProps={{
        user: currentUser,
        metrics,
        onClick: () => onClick(currentUser),
        rankChange: rankChanges.get(currentUser.id),
        rankChangeDurationMs,
        visibleColumns,
      }}
    />
  );
}

type UserLeaderboardProps = {
  metrics: LeaderboardMetricDef[];
  period: LeaderBoardPeriod;
  setPeriod: (v: LeaderBoardPeriod) => void;
  sortKey: string;
  setSortKey: (v: string) => void;
  visibleColumns: string[];
  setVisibleColumns: (v: string[]) => void;
  selectedGroupId: number | null;
  setSelectedGroupId: (v: number | null) => void;
  itemsPerPage: number;
  handleItemsPerPageChange: (v: number) => void;
  userGroups: LeaderboardUserGroup[];
  loading: boolean;
  refreshing: boolean;
  currentUser: LeaderBoardUser | null;
  paginatedUsers: LeaderBoardUser[];
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  handleUserClick: (user: LeaderBoardUser) => void;
  changedUserIds: Set<number>;
  rankChanges: Map<number, number>;
  rankChangeDurationMs?: number;
  enableRefreshFade?: boolean;
  navbarHeight?: number;
  followTopAdjustment?: number;
  floatingFollowInnerClassName?: string;
};

export function UserLeaderboard({
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
  page,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  handleUserClick,
  changedUserIds,
  rankChanges,
  rankChangeDurationMs,
  enableRefreshFade = false,
  navbarHeight,
  followTopAdjustment,
  floatingFollowInnerClassName,
}: UserLeaderboardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const metricKeys = useMemo(() => metrics.map(m => m.key), [metrics]);
  const sortLabels = useMemo(
    () => Object.fromEntries(metrics.map(m => [m.key, m.label])),
    [metrics],
  );
  const availableSortKeys = metricKeys.filter(key =>
    visibleColumns.includes(key),
  );

  useEffect(() => {
    if (visibleColumns.length === 0) {
      setVisibleColumns([metricKeys[0]]);
      return;
    }
    if (!visibleColumns.includes(sortKey)) {
      setSortKey(visibleColumns[0]);
    }
  }, [sortKey, setSortKey, setVisibleColumns, visibleColumns, metricKeys]);

  const columnOptions = metrics.map(m => ({ id: m.key, name: m.label }));

  const handleColumnsChange = (value: string[]) => {
    const nextColumns = value.filter(v => metricKeys.includes(v));
    if (nextColumns.length === 0) return;
    setVisibleColumns(nextColumns);
  };

  const filterControls = (
    <>
      <LeaderboardFilterField label={LEADERBOARD_TEXT.PERIOD}>
        <Select
          triggerClassName="w-32"
          selectedOption={period}
          options={PERIOD_OPTIONS}
          displayMapper={PERIOD_LABELS}
          setValue={setPeriod}
          placeholder={LEADERBOARD_TEXT.PERIOD}
        />
      </LeaderboardFilterField>
      <LeaderboardFilterField label={LEADERBOARD_TEXT.SORT_BY}>
        <Select
          triggerClassName="w-40"
          selectedOption={sortKey}
          options={availableSortKeys}
          displayMapper={sortLabels}
          setValue={setSortKey}
          placeholder={LEADERBOARD_TEXT.SORT_BY}
        />
      </LeaderboardFilterField>
      <LeaderboardFilterField label={LEADERBOARD_TEXT.GROUP}>
        <Select
          triggerClassName="w-40"
          selectedOption={
            selectedGroupId === null
              ? { id: null, name: LEADERBOARD_TEXT.ALL_GROUPS }
              : userGroups.find(g => g.id === selectedGroupId)
          }
          options={[
            { id: null, name: LEADERBOARD_TEXT.ALL_GROUPS },
            ...userGroups.map(g => ({ id: g.id, name: g.name })),
          ]}
          optionIdenfifier="id"
          optionDisplayKey="name"
          setValue={(option: GroupOption) => setSelectedGroupId(option.id)}
          placeholder={LEADERBOARD_TEXT.GROUP}
        />
      </LeaderboardFilterField>
      <LeaderboardFilterField label={LEADERBOARD_TEXT.ITEMS_PER_PAGE}>
        <Select
          triggerClassName="w-20"
          selectedOption={itemsPerPage.toString()}
          options={ITEMS_PER_PAGE_OPTIONS.map(String)}
          displayMapper={ITEMS_PER_PAGE_DISPLAY}
          setValue={(value: string) =>
            handleItemsPerPageChange(parseInt(value, 10))
          }
          placeholder={LEADERBOARD_TEXT.ITEMS_PER_PAGE}
        />
      </LeaderboardFilterField>
      <LeaderboardFilterField label={LEADERBOARD_TEXT.COLUMNS}>
        <div className="w-40">
          <MultiSelect
            values={visibleColumns}
            options={columnOptions}
            onValueChange={handleColumnsChange}
            displayKey="name"
            triggerClassName="h-8"
          />
        </div>
      </LeaderboardFilterField>
    </>
  );

  const rows = loading ? (
    <LeaderboardSkeleton
      columnCount={visibleColumns.length}
      rowCount={itemsPerPage}
      showPagination
      SkeletonComponent={LeaderboardCellSkeleton}
    />
  ) : paginatedUsers.length === 0 ? null : (
    <>
      <div className="flex flex-col gap-1">
        <AnimatePresence mode="popLayout">
          {paginatedUsers.map((u, index) => (
            <motion.div
              key={u.id}
              data-leaderboard-user-row-id={u.id}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                layout: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className={index % 2 === 1 ? 'bg-muted/50 rounded-2xl' : ''}
            >
              <UserRow
                user={u}
                metrics={metrics}
                onClick={() => handleUserClick(u)}
                isChanging={changedUserIds.has(u.id)}
                rankChange={rankChanges.get(u.id)}
                rankChangeDurationMs={rankChangeDurationMs}
                visibleColumns={visibleColumns}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <LeaderboardPagination
            page={page}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );

  return (
    <>
      <BaseLeaderboard
        title={LEADERBOARD_TEXT.USER_TITLE}
        filterControls={filterControls}
        loading={loading}
        refreshing={refreshing}
        enableRefreshFade={enableRefreshFade}
        onFullscreenChange={setIsFullscreen}
        enableFullscreenKeybind
        isEmpty={!loading && paginatedUsers.length === 0}
        emptyStateMessage={LEADERBOARD_TEXT.NO_DATA}
      >
        {rows}
      </BaseLeaderboard>

      {!isFullscreen && (
        <FloatingCurrentUserBar
          currentUser={currentUser}
          metrics={metrics}
          onClick={handleUserClick}
          rankChanges={rankChanges}
          rankChangeDurationMs={rankChangeDurationMs}
          visibleColumns={visibleColumns}
          navbarHeight={navbarHeight}
          followTopAdjustment={followTopAdjustment}
          floatingFollowInnerClassName={floatingFollowInnerClassName}
        />
      )}
    </>
  );
}
