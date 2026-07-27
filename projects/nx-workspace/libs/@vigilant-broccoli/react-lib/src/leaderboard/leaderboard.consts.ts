import { LeaderBoardPeriod, SortKey, TeamSortKey } from './leaderboard.types';

export const DEFAULT_RANK_CHANGE_DURATION_MS = 1500;
export const DEFAULT_REFRESH_INTERVAL_MS = 10000;
export const DEFAULT_CHANGE_ANIMATION_MS = 600;
export const DEFAULT_ITEMS_PER_PAGE = 10;

export const LEADERBOARD_TEXT = {
  USER_TITLE: "Today's Leaderboard",
  TEAM_TITLE: 'Team Leaderboard',
  PERIOD: 'Period',
  SORT_BY: 'Sort by',
  GROUP: 'Group',
  ALL_GROUPS: 'All groups',
  ITEMS_PER_PAGE: 'Per page',
  COLUMNS: 'Columns',
  PREVIOUS: 'Previous',
  NEXT: 'Next',
  NO_DATA: 'No data available',
  NO_GROUPS: 'No groups available',
  SELECT: 'Select',
} as const;

export const PERIOD_LABELS: Record<LeaderBoardPeriod, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  lifetime: 'Lifetime',
};

export const SORT_LABELS: Record<SortKey, string> = {
  totalRecordings: 'Total calls',
  averageNumberOfCallsPerDay: 'Calls per day',
  averageScore: 'Avg score',
  averageCallDuration: 'Avg duration',
  goldEarned: 'Gold earned',
};

export const STAT_LABELS: Record<SortKey, string> = {
  totalRecordings: 'Calls',
  averageNumberOfCallsPerDay: 'Per day',
  averageScore: 'Rating',
  averageCallDuration: 'Duration',
  goldEarned: 'Gold',
};

export const TEAM_SORT_LABELS: Record<TeamSortKey, string> = {
  totalCalls: 'Total calls',
  averageScore: 'Avg score',
  memberCount: 'Members',
};

export const TEAM_METRIC_LABELS = {
  calls: 'Calls',
  avgScore: 'Avg score',
  members: 'Members',
} as const;
