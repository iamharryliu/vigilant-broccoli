import { toYmd } from '../../lib/date-utils';

export type RecurringTask = {
  id: string;
  title: string;
  /** Weekdays the task shows on, 0 = Sunday (Date.getDay). */
  days: number[];
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

export const isEveryDay = (days: number[]) =>
  ALL_DAYS.every(day => days.includes(day));

const TASKS_STORAGE_KEY = 'home:recurring-tasks';
const DONE_STORAGE_KEY = 'home:recurring-tasks-done';

const dailyTask = (title: string): RecurringTask => ({
  id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  title,
  days: ALL_DAYS,
});

export const DEFAULT_TASKS: RecurringTask[] = [
  'Clear out dishwasher',
  'Morning dog walk',
  'Feed Niko breakfast',
  'Plan for dinner',
  'Prepare dinner',
  'Night dog walk',
  'Feed Niko dinner',
  'Kitchen cleanup (night)',
  'Run dishwasher (night)',
].map(dailyTask);

export const isDueOn = (task: RecurringTask, date: Date) =>
  task.days.includes(date.getDay());

export const describeDays = (days: number[]) =>
  isEveryDay(days)
    ? 'Daily'
    : WEEKDAYS.filter(({ day }) => days.includes(day))
        .map(({ label }) => label)
        .join(', ');

const readJson = <T>(key: string): T | null => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
};

// Tasks saved before recurrence became a day list carry `recurrence: 'daily'`
// with no days.
export const loadTasks = (): RecurringTask[] =>
  readJson<(Omit<RecurringTask, 'days'> & { days?: number[] })[]>(
    TASKS_STORAGE_KEY,
  )?.map(task => ({
    ...task,
    days:
      (task as { recurrence?: string }).recurrence === 'daily'
        ? ALL_DAYS
        : (task.days ?? ALL_DAYS),
  })) ?? DEFAULT_TASKS;

export const saveTasks = (tasks: RecurringTask[]) =>
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));

// Only today's completions are kept, so every task reappears unchecked the
// next day it is due.
export const loadDone = (): string[] => {
  const stored = readJson<{ date: string; done: string[] }>(DONE_STORAGE_KEY);
  return stored?.date === toYmd(new Date()) ? stored.done : [];
};

export const saveDone = (done: string[]) =>
  localStorage.setItem(
    DONE_STORAGE_KEY,
    JSON.stringify({ date: toYmd(new Date()), done }),
  );

export type OneOffTask = { id: string; title: string; checked: boolean };

const ONE_OFF_STORAGE_KEY = 'home:one-off-tasks';

export const loadOneOffTasks = (): OneOffTask[] =>
  readJson<OneOffTask[]>(ONE_OFF_STORAGE_KEY) ?? [];

export const saveOneOffTasks = (tasks: OneOffTask[]) =>
  localStorage.setItem(ONE_OFF_STORAGE_KEY, JSON.stringify(tasks));
