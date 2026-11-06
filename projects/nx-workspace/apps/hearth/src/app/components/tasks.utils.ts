export type RecurringTask = {
  id: string;
  title: string;
  /** Weekdays the task shows on, 0 = Sunday (Date.getDay). */
  days: number[];
};

export type DefaultTask = Omit<RecurringTask, 'id'>;

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

export const isDueOn = (task: RecurringTask, date: Date) =>
  task.days.includes(date.getDay());

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
