'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BaseLeaderboard } from './BaseLeaderboard';
import { LeaderboardSkeleton } from './LeaderboardSkeleton';
import { LeaderboardCellSkeleton } from './Skeleton';
import { LeaderboardFilterField } from './LeaderboardFilterField';
import { LeaderboardMetricCell } from './LeaderboardMetricCell';
import { LeaderboardRow } from './LeaderboardRow';
import {
  TEAM_PERIODS,
  TEAM_SORT_KEYS,
  TeamLeaderboardRow,
  TeamSortKey,
} from './leaderboard.types';
import {
  DEFAULT_RANK_CHANGE_DURATION_MS,
  LEADERBOARD_TEXT,
  PERIOD_LABELS,
  TEAM_METRIC_LABELS,
  TEAM_SORT_LABELS,
} from './leaderboard.consts';
import { Select } from '../components/Select';
import { TeamAvatar } from '../components/TeamAvatar';

type TeamLeaderboardProps = {
  period: (typeof TEAM_PERIODS)[number];
  setPeriod: (value: (typeof TEAM_PERIODS)[number]) => void;
  sortKey: TeamSortKey;
  setSortKey: (value: TeamSortKey) => void;
  loading: boolean;
  refreshing: boolean;
  sortedRows: TeamLeaderboardRow[];
  enableRefreshFade?: boolean;
  changedTeamIds?: Set<number>;
  rankChanges?: Map<number, number>;
  rankChangeDurationMs?: number;
};

export function TeamLeaderboard({
  period,
  setPeriod,
  sortKey,
  setSortKey,
  loading,
  refreshing,
  sortedRows,
  enableRefreshFade = false,
  changedTeamIds = new Set(),
  rankChanges = new Map(),
  rankChangeDurationMs = DEFAULT_RANK_CHANGE_DURATION_MS,
}: TeamLeaderboardProps) {
  const filterControls = (
    <>
      <LeaderboardFilterField label={LEADERBOARD_TEXT.PERIOD}>
        <Select
          triggerClassName="w-32"
          selectedOption={period}
          options={TEAM_PERIODS}
          displayMapper={PERIOD_LABELS}
          setValue={setPeriod}
          placeholder={LEADERBOARD_TEXT.PERIOD}
        />
      </LeaderboardFilterField>
      <LeaderboardFilterField label={LEADERBOARD_TEXT.SORT_BY}>
        <Select
          triggerClassName="w-36"
          selectedOption={sortKey}
          options={[...TEAM_SORT_KEYS]}
          displayMapper={TEAM_SORT_LABELS}
          setValue={setSortKey}
          placeholder={LEADERBOARD_TEXT.SORT_BY}
        />
      </LeaderboardFilterField>
    </>
  );

  const rows = loading ? (
    <LeaderboardSkeleton
      columnCount={3}
      rowCount={sortedRows.length > 0 ? sortedRows.length : 5}
      metricsClassName="min-w-[16rem] gap-3"
      metricAlignment="end"
      nameWidthClassName="w-44"
      SkeletonComponent={LeaderboardCellSkeleton}
    />
  ) : sortedRows.length === 0 ? null : (
    <div className="flex flex-col gap-1">
      <AnimatePresence mode="popLayout">
        {sortedRows.map((team, index) => (
          <motion.div
            key={team.id}
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              layout: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <LeaderboardRow
              rank={team.rank}
              name={team.name}
              avatar={
                <TeamAvatar
                  avatarUrl={team.image}
                  name={team.name}
                  size="small"
                />
              }
              rankChange={rankChanges.get(team.id)}
              rankChangeDurationMs={rankChangeDurationMs}
              className={index % 2 === 1 ? 'bg-muted/50 rounded-2xl' : ''}
            >
              <div className="grid grid-cols-3 gap-3 min-w-[16rem]">
                <LeaderboardMetricCell
                  label={TEAM_METRIC_LABELS.calls}
                  value={team.totalCalls}
                  isChanging={changedTeamIds.has(team.id)}
                />
                <LeaderboardMetricCell
                  label={TEAM_METRIC_LABELS.avgScore}
                  value={team.averageScore.toFixed(1)}
                  isChanging={changedTeamIds.has(team.id)}
                />
                <LeaderboardMetricCell
                  label={TEAM_METRIC_LABELS.members}
                  value={team.memberCount}
                  isChanging={changedTeamIds.has(team.id)}
                />
              </div>
            </LeaderboardRow>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <BaseLeaderboard
      title={LEADERBOARD_TEXT.TEAM_TITLE}
      filterControls={filterControls}
      loading={loading}
      refreshing={refreshing}
      enableRefreshFade={enableRefreshFade}
      isEmpty={!loading && sortedRows.length === 0}
      emptyStateMessage={LEADERBOARD_TEXT.NO_GROUPS}
    >
      {rows}
    </BaseLeaderboard>
  );
}
