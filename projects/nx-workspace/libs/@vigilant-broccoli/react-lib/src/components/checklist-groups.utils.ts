const DAY_LABEL = {
  TODAY: 'Today',
  YESTERDAY: 'Yesterday',
} as const;

const UNDATED_GROUP_KEY = 'undated';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const DAY_HEADER_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
};

export interface CompletedTimestamped {
  completedAt?: string | null;
  updatedAt?: string;
}

export interface CompletedDayGroup<T> {
  key: string;
  /** Null for the trailing group of rows without a timestamp. */
  label: string | null;
  items: T[];
}

const toTime = ({ completedAt, updatedAt }: CompletedTimestamped) => {
  const stamp = completedAt ?? updatedAt;
  const time = stamp ? new Date(stamp).getTime() : NaN;
  return Number.isNaN(time) ? null : time;
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const toDayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

/** "Today", "Yesterday", else e.g. "Mon, Nov 3", with the year when not `now`'s. */
export const formatCompletedDayHeader = (day: Date, now = new Date()) => {
  // Rounded because a DST change makes a calendar day 23 or 25 hours long.
  const daysAgo = Math.round(
    (startOfDay(now).getTime() - startOfDay(day).getTime()) / MS_PER_DAY,
  );
  if (daysAgo === 0) return DAY_LABEL.TODAY;
  if (daysAgo === 1) return DAY_LABEL.YESTERDAY;
  return day.toLocaleDateString(undefined, {
    ...DAY_HEADER_FORMAT,
    ...(day.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  });
};

/**
 * Groups completed rows by the local day of `completedAt ?? updatedAt`, newest
 * first within and across groups. Rows without a valid timestamp keep their
 * order in a final, unlabelled group.
 */
export const groupCompletedByDay = <T extends CompletedTimestamped>(
  items: T[],
  now = new Date(),
): CompletedDayGroup<T>[] => {
  const dated = items
    .map(item => ({ item, time: toTime(item) }))
    .filter((entry): entry is { item: T; time: number } => entry.time !== null)
    .sort((a, b) => b.time - a.time);
  const groups = new Map<string, CompletedDayGroup<T>>();
  dated.forEach(({ item, time }) => {
    const day = new Date(time);
    const key = toDayKey(day);
    const group = groups.get(key);
    if (group) group.items.push(item);
    else
      groups.set(key, {
        key,
        label: formatCompletedDayHeader(day, now),
        items: [item],
      });
  });
  const undated = items.filter(item => toTime(item) === null);
  return [
    ...groups.values(),
    ...(undated.length > 0
      ? [{ key: UNDATED_GROUP_KEY, label: null, items: undated }]
      : []),
  ];
};
