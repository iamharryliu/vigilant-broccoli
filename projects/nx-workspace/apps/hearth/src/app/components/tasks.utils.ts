import { toYmd } from '../../lib/date-utils';

export type RecurringTask = {
  id: string;
  title: string;
  /** Weekdays the task shows on, 0 = Sunday (Date.getDay). */
  days: number[];
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

export const isEveryDay = (days: number[]) =>
  ALL_DAYS.every(day => days.includes(day));

const task = (title: string, days: number[] = ALL_DAYS): DefaultTask => ({
  title,
  days,
});

const MONDAY = 1;
const WEDNESDAY = 3;
const FRIDAY = 5;

export const DEFAULT_TASKS: DefaultTask[] = [
  task('Clear out dishwasher'),
  task('Morning dog walk'),
  task('Clean Niko’s bowls'),
  task('Feed Niko breakfast'),
  task('Plan for dinner'),
  task('Prepare dinner'),
  task('Night dog walk'),
  task('Feed Niko dinner'),
  task('Kitchen cleanup (night)'),
  task('Run dishwasher (night)'),
  task('Run robot vacuum', [MONDAY, WEDNESDAY, FRIDAY]),
  task('Take out trash', [FRIDAY]),
];

export const occursOn = (task: Pick<RecurringTask, 'days'>, date: Date) =>
  task.days.includes(date.getDay());

const DAYS_PER_WEEK = 7;

const fromYmd = (ymd: string) => {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Occurrence date (YYYY-MM-DD) of the task's single pending instance on
 * `today`, or null. A pending instance exists when a scheduled weekday falls
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
  for (let i = 0; i < DAYS_PER_WEEK && cursor <= end; i++) {
    if (occursOn(task, cursor)) return toYmd(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
};

/** Short label such as "Nov 5" for a missed instance's scheduled date. */
export const formatInstanceDate = (ymd: string) =>
  fromYmd(ymd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const describeDays = (days: number[]) =>
  isEveryDay(days)
    ? 'Daily'
    : WEEKDAYS.filter(({ day }) => days.includes(day))
        .map(({ label }) => label)
        .join(', ');

export const TASKS_API = {
  RECURRING: '/api/tasks/recurring',
  RECURRING_RESET: '/api/tasks/recurring/reset',
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
