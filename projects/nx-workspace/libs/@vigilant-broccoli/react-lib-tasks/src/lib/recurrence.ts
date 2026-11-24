/** When a recurring task repeats; the part of a task the schedule picker edits. */
export type TaskSchedule = {
  /** Weekdays the task shows on, 0 = Sunday (Date.getDay). */
  days: number[];
  /**
   * Weeks of the month the weekdays apply in (1-4, LAST_WEEK_OF_MONTH); null
   * or absent repeats every week.
   */
  monthlyNth?: number[] | null;
  /**
   * Days of the month (1-31) the task repeats on, ignoring `days`; a day past
   * the end of a short month falls on its last day. Null or absent when the
   * task repeats by weekday.
   */
  monthlyDates?: number[] | null;
  /**
   * Local YYYY-MM-DD of a task that does not repeat, ignoring the other
   * fields. Null or absent when the task repeats.
   */
  onceDate?: string | null;
  /**
   * Local MM-DD the task repeats on every year, ignoring the other fields;
   * Feb 29 falls on Feb 28 in common years. Null or absent when it does not
   * repeat annually.
   */
  annualDate?: string | null;
};

export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Days a month can have, counting Feb 29. */
export const getMaxDaysInMonth = (month: number) =>
  new Date(2000, month, 0).getDate();

export const toAnnualDate = (month: number, day: number) =>
  `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const fromAnnualDate = (annualDate: string) => {
  const [month, day] = annualDate.split('-').map(Number);
  return { month, day };
};

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const fromDateKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

// Week order shown in the UI: Monday first.
export const WEEKDAYS = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 0, label: 'Sun' },
];

export const LAST_WEEK_OF_MONTH = -1;

export const MONTHLY_ORDINALS = [
  { nth: 1, label: '1st' },
  { nth: 2, label: '2nd' },
  { nth: 3, label: '3rd' },
  { nth: 4, label: '4th' },
  { nth: LAST_WEEK_OF_MONTH, label: 'Last' },
];

export const MONTH_DATES = Array.from({ length: 31 }, (_, i) => i + 1);

// Dates past a short month's end fall on its last day, so 31 always means it.
export const LAST_DATE_OF_MONTH = 31;

export const isEveryDay = (days: number[]) =>
  ALL_DAYS.every(day => days.includes(day));

export const isDaily = ({
  days,
  monthlyNth,
  monthlyDates,
  onceDate,
  annualDate,
}: TaskSchedule) =>
  !monthlyNth && !monthlyDates && !onceDate && !annualDate && isEveryDay(days);

const DAYS_PER_WEEK = 7;
const MAX_NUMBERED_WEEK = 4;
// Consecutive occurrences of one ordinal weekday are 28 or 35 days apart.
const MAX_MONTHLY_GAP_DAYS = 5 * DAYS_PER_WEEK;
const MAX_ANNUAL_GAP_DAYS = 366;

/** Most days that can pass between two occurrences of the schedule. */
export const getMaxOccurrenceGapDays = ({
  monthlyNth,
  monthlyDates,
  annualDate,
}: TaskSchedule) =>
  annualDate
    ? MAX_ANNUAL_GAP_DAYS
    : monthlyNth || monthlyDates
      ? MAX_MONTHLY_GAP_DAYS
      : DAYS_PER_WEEK;

const getDaysInMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const isInWeekOfMonth = (date: Date, nth: number) =>
  nth === LAST_WEEK_OF_MONTH
    ? date.getDate() + DAYS_PER_WEEK > getDaysInMonth(date)
    : Math.ceil(date.getDate() / DAYS_PER_WEEK) === nth;

/** The ordinal option a date falls in: 1st-4th, or Last for the fifth week. */
export const getWeekOfMonthOrdinal = (date: Date) => {
  const nth = Math.ceil(date.getDate() / DAYS_PER_WEEK);
  return nth > MAX_NUMBERED_WEEK ? LAST_WEEK_OF_MONTH : nth;
};

const isOnMonthDate = (date: Date, monthDate: number) =>
  date.getDate() === Math.min(monthDate, getDaysInMonth(date));

const isOnAnnualDate = (date: Date, annualDate: string) => {
  const { month, day } = fromAnnualDate(annualDate);
  return (
    date.getMonth() + 1 === month &&
    date.getDate() === Math.min(day, getDaysInMonth(date))
  );
};

export const occursOn = (
  { days, monthlyNth, monthlyDates, onceDate, annualDate }: TaskSchedule,
  date: Date,
) =>
  onceDate
    ? toDateKey(date) === onceDate
    : annualDate
      ? isOnAnnualDate(date, annualDate)
      : monthlyDates
        ? monthlyDates.some(monthDate => isOnMonthDate(date, monthDate))
        : days.includes(date.getDay()) &&
          (!monthlyNth || monthlyNth.some(nth => isInWeekOfMonth(date, nth)));

// Every valid selection recurs within a year; two years leaves headroom.
const MAX_PREVIEW_SCAN_DAYS = 731;

/** The next `count` dates the schedule occurs on, starting at `from`. */
export const getNextOccurrences = (
  schedule: TaskSchedule,
  from: Date,
  count: number,
): Date[] => {
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const found: Date[] = [];
  for (
    let i = 0;
    i < MAX_PREVIEW_SCAN_DAYS && found.length < count;
    i++, cursor.setDate(cursor.getDate() + 1)
  ) {
    if (occursOn(schedule, cursor)) found.push(new Date(cursor));
  }
  return found;
};

export const formatOccurrenceDate = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** "Today", "Tomorrow" or "In N days" for a date relative to `from`. */
export const getRelativeDayLabel = (date: Date, from: Date) => {
  const days = Math.round(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()) /
      MS_PER_DAY,
  );
  if (days === 0) return 'Today';
  return days === 1 ? 'Tomorrow' : `In ${days} days`;
};

const joinWithAmpersand = (labels: string[]) =>
  labels.length > 1
    ? `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`
    : labels.join('');

const getWeekdayLabels = (days: number[]) =>
  WEEKDAYS.filter(({ day }) => days.includes(day)).map(({ label }) => label);

const toOrdinalSuffix = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
};

export const describeDays = ({
  days,
  monthlyNth,
  monthlyDates,
  onceDate,
  annualDate,
}: TaskSchedule) => {
  if (onceDate) return `Once on ${formatOccurrenceDate(fromDateKey(onceDate))}`;
  if (annualDate) {
    const { month, day } = fromAnnualDate(annualDate);
    return `Every ${MONTH_LABELS[month - 1]} ${toOrdinalSuffix(day)}`;
  }
  if (monthlyDates) {
    const dates = [...monthlyDates]
      .sort((a, b) => a - b)
      .map(date =>
        date === LAST_DATE_OF_MONTH ? 'last day' : toOrdinalSuffix(date),
      );
    return `${joinWithAmpersand(dates)} of month`;
  }
  if (monthlyNth) {
    const ordinals = MONTHLY_ORDINALS.filter(({ nth }) =>
      monthlyNth.includes(nth),
    ).map(({ label }) => label);
    return `${joinWithAmpersand(ordinals)} ${joinWithAmpersand(getWeekdayLabels(days))}`;
  }
  return isEveryDay(days) ? 'Daily' : getWeekdayLabels(days).join(', ');
};
