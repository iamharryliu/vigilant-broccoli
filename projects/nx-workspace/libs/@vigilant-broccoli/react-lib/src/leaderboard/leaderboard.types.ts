import { ComponentType } from 'react';

export type DisplaySize = 'default' | 'large' | 'xl' | '2xl';

export type LeaderBoardPeriod = 'day' | 'week' | 'month' | 'lifetime';

/** Arbitrary numeric stats keyed by metric key, e.g. `{ points: 42, memberCount: 8 }`. */
export type LeaderboardMetrics = Record<string, number>;

export type LeaderboardMetricFormat =
  | 'integer'
  | 'decimal1'
  | 'duration'
  | 'compact';

/** Describes one column/metric a leaderboard can sort and display by. */
export interface LeaderboardMetricDef {
  key: string;
  label: string;
  /** Shown under the value in a row; defaults to `label`. */
  shortLabel?: string;
  /** Defaults to `'integer'`. */
  format?: LeaderboardMetricFormat;
  icon?: ComponentType<{ size?: number; className?: string }>;
  iconClassName?: string;
}

export interface LeaderBoardUser {
  id: number;
  email: string;
  displayName: string;
  image?: string;
  companyId: number;
  rank: number;
  metrics: LeaderboardMetrics;
}

export type LeaderboardUserGroup = {
  id: number;
  name: string;
};

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50] as const;

export type TeamLeaderboardRow = {
  id: number;
  name: string;
  image?: string;
  rank: number;
  metrics: LeaderboardMetrics;
};

export const TEAM_PERIODS: LeaderBoardPeriod[] = [
  'day',
  'week',
  'month',
  'lifetime',
];
