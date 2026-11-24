import {
  TaskSchedule,
  getMaxOccurrenceGapDays,
  occursOn,
} from '@vigilant-broccoli/react-lib-tasks/recurrence';
import { toYmd } from '../../lib/date-utils';

export type RecurringTask = TaskSchedule & {
  id: string;
  title: string;
  /** ISO timestamp; its local date bounds the first pending instance. */
  createdAt?: string;
  /** Assignee of the pending occurrence only; cleared when it is completed. */
  assignedUserId?: string | null;
  /** Set once the task is removed; its completions stay in Completed. */
  archivedAt?: string | null;
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
  'id' | 'assignedUserId' | 'createdAt' | 'archivedAt'
>;

/** An accepted home member (owner included) a task can be assigned to. */
export type TaskAssignee = {
  userId: string;
  email: string;
  displayName: string | null;
};

export const getAssigneeLabel = ({ displayName, email }: TaskAssignee) =>
  displayName || email;

export const toDefaultTask = ({
  title,
  days,
  monthlyNth,
  monthlyDates,
}: RecurringTask): DefaultTask => ({
  title,
  days,
  ...(monthlyNth && { monthlyNth }),
  ...(monthlyDates && { monthlyDates }),
});

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
  const scanDays = getMaxOccurrenceGapDays(task);
  for (let i = 0; i < scanDays && cursor <= end; i++) {
    if (occursOn(task, cursor)) return toYmd(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
};

/** Short label such as "Nov 5" for a missed instance's scheduled date. */
export const formatInstanceDate = (ymd: string) =>
  fromYmd(ymd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
