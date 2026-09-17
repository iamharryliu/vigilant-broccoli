import { DotPaths } from '@vigilant-broccoli/react-lib';
import en from '../i18n/en.json';

type TranslationKey = DotPaths<typeof en>;

export const REPO_TIMELINE_URL = `${import.meta.env.BASE_URL}repo-timeline.json`;

export const TIMELINE_METRIC = {
  LINES_OF_CODE: 'linesOfCode',
  COMMITS: 'commits',
  PULL_REQUESTS: 'pullRequests',
  LINES_ADDED: 'linesAdded',
  LINES_DELETED: 'linesDeleted',
} as const;
export type TimelineMetric =
  (typeof TIMELINE_METRIC)[keyof typeof TIMELINE_METRIC];

export const TIMELINE_GRANULARITY = {
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
} as const;
export type TimelineGranularity =
  (typeof TIMELINE_GRANULARITY)[keyof typeof TIMELINE_GRANULARITY];

export const TIMELINE_VIEW = {
  GRAPH: 'graph',
  TIMELINE: 'timeline',
} as const;
export type TimelineView = (typeof TIMELINE_VIEW)[keyof typeof TIMELINE_VIEW];

export const TIMELINE_VIEW_OPTIONS: {
  value: TimelineView;
  labelKey: TranslationKey;
}[] = [
  { value: TIMELINE_VIEW.GRAPH, labelKey: 'REPO_TIMELINE_PAGE.VIEW_GRAPH' },
  {
    value: TIMELINE_VIEW.TIMELINE,
    labelKey: 'REPO_TIMELINE_PAGE.VIEW_TIMELINE',
  },
];

export const TIMELINE_ORDER = {
  NEWEST_FIRST: 'newest',
  OLDEST_FIRST: 'oldest',
} as const;
export type TimelineOrder =
  (typeof TIMELINE_ORDER)[keyof typeof TIMELINE_ORDER];

export const TIMELINE_ORDER_OPTIONS: {
  value: TimelineOrder;
  labelKey: TranslationKey;
}[] = [
  {
    value: TIMELINE_ORDER.NEWEST_FIRST,
    labelKey: 'REPO_TIMELINE_PAGE.ORDER_NEWEST',
  },
  {
    value: TIMELINE_ORDER.OLDEST_FIRST,
    labelKey: 'REPO_TIMELINE_PAGE.ORDER_OLDEST',
  },
];

export const TIMELINE_METRIC_OPTIONS: {
  value: TimelineMetric;
  labelKey: TranslationKey;
}[] = [
  {
    value: TIMELINE_METRIC.LINES_OF_CODE,
    labelKey: 'REPO_TIMELINE_PAGE.METRIC_LINES_OF_CODE',
  },
  {
    value: TIMELINE_METRIC.COMMITS,
    labelKey: 'REPO_TIMELINE_PAGE.METRIC_COMMITS',
  },
  {
    value: TIMELINE_METRIC.PULL_REQUESTS,
    labelKey: 'REPO_TIMELINE_PAGE.METRIC_PULL_REQUESTS',
  },
  {
    value: TIMELINE_METRIC.LINES_ADDED,
    labelKey: 'REPO_TIMELINE_PAGE.METRIC_LINES_ADDED',
  },
  {
    value: TIMELINE_METRIC.LINES_DELETED,
    labelKey: 'REPO_TIMELINE_PAGE.METRIC_LINES_DELETED',
  },
];

export const TIMELINE_GRANULARITY_OPTIONS: {
  value: TimelineGranularity;
  labelKey: TranslationKey;
}[] = [
  {
    value: TIMELINE_GRANULARITY.DAY,
    labelKey: 'REPO_TIMELINE_PAGE.GRANULARITY_DAY',
  },
  {
    value: TIMELINE_GRANULARITY.MONTH,
    labelKey: 'REPO_TIMELINE_PAGE.GRANULARITY_MONTH',
  },
  {
    value: TIMELINE_GRANULARITY.YEAR,
    labelKey: 'REPO_TIMELINE_PAGE.GRANULARITY_YEAR',
  },
];

type RawDay = [
  date: string,
  commits: number,
  pullRequests: number,
  added: number,
  deleted: number,
];

export interface RepoTimelineData {
  days: RawDay[];
}

export interface TimelineBucket {
  key: string;
  commits: number;
  pullRequests: number;
  linesAdded: number;
  linesDeleted: number;
  linesOfCode: number;
}

export const DAY_KEY_LENGTH = 10;
const MONTH_KEY_LENGTH = 7;
const YEAR_KEY_LENGTH = 4;
const MONTH_KEY_START = YEAR_KEY_LENGTH + 1;

export const toYearKey = (key: string) => key.slice(0, YEAR_KEY_LENGTH);
export const toMonthNumber = (key: string) =>
  key.slice(MONTH_KEY_START, MONTH_KEY_LENGTH);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toDayKey = (date: Date) => date.toISOString().slice(0, DAY_KEY_LENGTH);

const listDayKeys = (first: string, last: string) => {
  const keys: string[] = [];
  const end = new Date(last).getTime();
  for (let t = new Date(first).getTime(); t <= end; t += MS_PER_DAY) {
    keys.push(toDayKey(new Date(t)));
  }
  return keys;
};

const toBucketKey = (dayKey: string, granularity: TimelineGranularity) => {
  if (granularity === TIMELINE_GRANULARITY.YEAR) return toYearKey(dayKey);
  if (granularity === TIMELINE_GRANULARITY.MONTH)
    return dayKey.slice(0, MONTH_KEY_LENGTH);
  return dayKey;
};

export const buildTimeline = (
  data: RepoTimelineData,
  granularity: TimelineGranularity,
): TimelineBucket[] => {
  if (data.days.length === 0) return [];

  const statsByDay = new Map(data.days.map(day => [day[0], day]));
  const lastRecordedDay = data.days[data.days.length - 1][0];
  const today = toDayKey(new Date());
  const lastDay = lastRecordedDay > today ? lastRecordedDay : today;

  const buckets: TimelineBucket[] = [];
  let linesOfCode = 0;

  listDayKeys(data.days[0][0], lastDay).forEach(dayKey => {
    const key = toBucketKey(dayKey, granularity);
    let bucket = buckets[buckets.length - 1];
    if (!bucket || bucket.key !== key) {
      bucket = {
        key,
        commits: 0,
        pullRequests: 0,
        linesAdded: 0,
        linesDeleted: 0,
        linesOfCode,
      };
      buckets.push(bucket);
    }

    const day = statsByDay.get(dayKey);
    if (!day) return;
    const [, commits, pullRequests, added, deleted] = day;
    bucket.commits += commits;
    bucket.pullRequests += pullRequests;
    bucket.linesAdded += added;
    bucket.linesDeleted += deleted;
    linesOfCode += added - deleted;
    bucket.linesOfCode = linesOfCode;
  });

  return buckets;
};

const NICE_STEPS = [1, 2, 2.5, 5, 10];
const TICK_COUNT = 4;

export const toNiceTicks = (max: number) => {
  if (max <= 0) return [0, 1];
  const rawStep = max / TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step =
    (NICE_STEPS.find(s => s * magnitude >= rawStep) ?? 10) * magnitude;
  const ticks = [0];
  while (ticks[ticks.length - 1] < max) {
    ticks.push(ticks[ticks.length - 1] + step);
  }
  return ticks;
};
