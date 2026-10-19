export const UPTIME_STATUS = {
  UP: 'up',
  DOWN: 'down',
  DEGRADED: 'degraded',
  UNKNOWN: 'unknown',
} as const;
export type UpptimeStatus = (typeof UPTIME_STATUS)[keyof typeof UPTIME_STATUS];

// One entry of Upptime's generated `history/summary.json`.
export interface UpptimeService {
  name: string;
  url: string;
  status: UpptimeStatus;
  uptime?: string;
  time?: number;
  uptimeDay?: string;
  uptimeWeek?: string;
  uptimeMonth?: string;
  uptimeYear?: string;
  // UTC YYYY-MM-DD -> minutes down; days without downtime are absent.
  dailyMinutesDown?: Record<string, number>;
}

export const UPTIME_STATUS_DOT_CLASS: Record<UpptimeStatus, string> = {
  [UPTIME_STATUS.UP]: 'bg-emerald-500',
  [UPTIME_STATUS.DOWN]: 'bg-red-500',
  [UPTIME_STATUS.DEGRADED]: 'bg-amber-500',
  [UPTIME_STATUS.UNKNOWN]: 'bg-gray-400',
};

export const UPTIME_BAR_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEGRADED_MINUTES_LIMIT = 60;

export const toUpptimeSummaryUrl = (
  owner: string,
  repo: string,
  branch = 'main',
) =>
  `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/history/summary.json`;

export const getLastUtcDays = (count = UPTIME_BAR_DAYS): string[] => {
  const today = Date.now();
  return Array.from({ length: count }, (_, i) =>
    new Date(today - (count - 1 - i) * MS_PER_DAY).toISOString().slice(0, 10),
  );
};

export const getDowntimeBarClass = (minutes: number): string => {
  if (minutes === 0) return UPTIME_STATUS_DOT_CLASS.up;
  if (minutes < DEGRADED_MINUTES_LIMIT) return UPTIME_STATUS_DOT_CLASS.degraded;
  return UPTIME_STATUS_DOT_CLASS.down;
};

export const getUpptimeServiceDisplayText = (svc: UpptimeService): string => {
  try {
    const { host, pathname } = new URL(svc.url);
    return pathname === '/' ? host : `${host}${pathname}`;
  } catch {
    return svc.name;
  }
};
