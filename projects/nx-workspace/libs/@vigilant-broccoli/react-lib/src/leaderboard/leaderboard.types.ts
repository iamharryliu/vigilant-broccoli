export interface LeaderboardItem {
  id: string | number;
  rank: number;
  displayName: string;
  image?: string;
  metrics: Record<string, number | string>;
}

export type DisplaySize = 'default' | 'large' | 'xl' | '2xl';

export type LeaderBoardPeriod = 'day' | 'week' | 'month' | 'lifetime';

export interface LeaderBoardUserStats {
  totalRecordings: number;
  averageNumberOfCallsPerDay: number;
  averageScore: number;
  averageCallDuration: number;
  totalSales: number;
  goldEarned: number;
}

export interface LeaderBoardUser extends LeaderboardItem {
  id: number;
  email: string;
  displayName: string;
  image?: string;
  companyId: number;
  stats: LeaderBoardUserStats;
  rank: number;
  metrics: Record<string, number | string>;
}

export type LeaderboardUserGroup = {
  id: number;
  name: string;
};

export type LeaderboardMetricColumn =
  | 'totalRecordings'
  | 'averageNumberOfCallsPerDay'
  | 'averageScore'
  | 'averageCallDuration'
  | 'goldEarned';

export const sortKeys = [
  'totalRecordings',
  'averageNumberOfCallsPerDay',
  'averageScore',
  'averageCallDuration',
  'goldEarned',
] as const;

export type SortKey = (typeof sortKeys)[number];

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50] as const;

export type TeamLeaderboardRow = {
  id: number;
  name: string;
  image?: string;
  rank: number;
  memberCount: number;
  totalCalls: number;
  averageScore: number;
};

export const TEAM_PERIODS: LeaderBoardPeriod[] = [
  'day',
  'week',
  'month',
  'lifetime',
];
export const TEAM_SORT_KEYS = [
  'totalCalls',
  'averageScore',
  'memberCount',
] as const;
export type TeamSortKey = (typeof TEAM_SORT_KEYS)[number];
