import { toYmd } from '../../lib/date-utils';

export type RecurringTask = {
  id: string;
  title: string;
  /** Weekdays the task shows on, 0 = Sunday (Date.getDay). */
  days: number[];
  /**
   * Weeks of the month the weekdays apply in (1-4, LAST_WEEK_OF_MONTH); null
   * or absent repeats every week.
   */
  monthlyNth?: number[] | null;
  /** ISO timestamp; its local date bounds the first pending instance. */
  createdAt?: string;
  /** Assignee of the pending occurrence only; cleared when it is completed. */
  assignedUserId?: string | null;
};

/** One completed occurrence of a recurring task. */
export type TaskCompletion = {
  id: string;
  taskId: string;
  /** Client-local YYYY-MM-DD the occurrence was completed on. */
  date: string;
  /** ISO timestamp the completion was recorded; groups it in Completed. */
  completedAt: string;
  /** This occurrence's assignee, copied from the task on completion. */
  assignedUserId: string | null;
};

export type DefaultTask = Omit<
  RecurringTask,
  'id' | 'assignedUserId' | 'createdAt'
>;

/** An accepted home member (owner included) a task can be assigned to. */
export type TaskAssignee = {
  userId: string;
  email: string;
  displayName: string | null;
};

export const getAssigneeLabel = ({ displayName, email }: TaskAssignee) =>
  displayName || email;

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

export const isEveryDay = (days: number[]) =>
  ALL_DAYS.every(day => days.includes(day));

export const isDaily = ({
  days,
  monthlyNth,
}: Pick<RecurringTask, 'days' | 'monthlyNth'>) =>
  !monthlyNth && isEveryDay(days);

export const toDefaultTask = ({
  title,
  days,
  monthlyNth,
}: RecurringTask): DefaultTask =>
  monthlyNth ? { title, days, monthlyNth } : { title, days };

const DAYS_PER_WEEK = 7;
// Consecutive occurrences of one ordinal weekday are 28 or 35 days apart.
const MAX_MONTHLY_GAP_DAYS = 5 * DAYS_PER_WEEK;

const getDaysInMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const isInWeekOfMonth = (date: Date, nth: number) =>
  nth === LAST_WEEK_OF_MONTH
    ? date.getDate() + DAYS_PER_WEEK > getDaysInMonth(date)
    : Math.ceil(date.getDate() / DAYS_PER_WEEK) === nth;

export const occursOn = (
  { days, monthlyNth }: Pick<RecurringTask, 'days' | 'monthlyNth'>,
  date: Date,
) =>
  days.includes(date.getDay()) &&
  (!monthlyNth || monthlyNth.some(nth => isInWeekOfMonth(date, nth)));

const fromYmd = (ymd: string) => {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Occurrence date (YYYY-MM-DD) of the task's single pending instance on
 * `today`, or null. A pending instance exists when a scheduled day falls
 * after the latest completion (or on/after the creation date with none) and
 * on/before today; the earliest such day is returned so a missed occurrence
 * carries over.
 */
export const getPendingOccurrenceDate = (
  task: RecurringTask,
  completions: TaskCompletion[],
  today: Date,
): string | null => {
  const latest = completions
    .filter(({ taskId }) => taskId === task.id)
    .reduce<string | null>(
      (max, { date }) => (max === null || date > max ? date : max),
      null,
    );
  const cursor = latest
    ? fromYmd(latest)
    : task.createdAt
      ? new Date(new Date(task.createdAt).setHours(0, 0, 0, 0))
      : null;
  if (!cursor) return occursOn(task, today) ? toYmd(today) : null;
  if (latest) cursor.setDate(cursor.getDate() + 1);

  const end = fromYmd(toYmd(today));
  const scanDays = task.monthlyNth ? MAX_MONTHLY_GAP_DAYS : DAYS_PER_WEEK;
  for (let i = 0; i < scanDays && cursor <= end; i++) {
    if (occursOn(task, cursor)) return toYmd(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
};

/** Short label such as "Nov 5" for a missed instance's scheduled date. */
export const formatInstanceDate = (ymd: string) =>
  fromYmd(ymd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const joinWithAmpersand = (labels: string[]) =>
  labels.length > 1
    ? `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`
    : labels.join('');

const getWeekdayLabels = (days: number[]) =>
  WEEKDAYS.filter(({ day }) => days.includes(day)).map(({ label }) => label);

export const describeDays = ({
  days,
  monthlyNth,
}: Pick<RecurringTask, 'days' | 'monthlyNth'>) => {
  if (monthlyNth) {
    const ordinals = MONTHLY_ORDINALS.filter(({ nth }) =>
      monthlyNth.includes(nth),
    ).map(({ label }) => label);
    return `${joinWithAmpersand(ordinals)} ${joinWithAmpersand(getWeekdayLabels(days))}`;
  }
  return isEveryDay(days) ? 'Daily' : getWeekdayLabels(days).join(', ');
};

export const TASKS_API = {
  RECURRING: '/api/tasks/recurring',
  RECURRING_IMPORT: '/api/tasks/recurring/import',
  COMPLETIONS: '/api/tasks/completions',
  ONE_OFF: '/api/tasks/one-off',
};

// Tasks lived in localStorage before they moved to Supabase; the keys are
// removed once so stale copies do not linger in the browser.
export const LEGACY_TASK_STORAGE_KEYS = [
  'home:recurring-tasks',
  'home:recurring-tasks-done',
  'home:one-off-tasks',
];
