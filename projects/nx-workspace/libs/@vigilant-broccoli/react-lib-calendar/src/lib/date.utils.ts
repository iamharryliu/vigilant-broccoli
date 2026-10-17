import { CalendarDayGroup, CalendarEventInput } from './calendar.types';

const MONTH_YEAR_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'long',
  year: 'numeric',
};

const DAY_HEADER_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

export const toDate = (value: string | Date | null | undefined): Date =>
  value instanceof Date ? value : new Date(value ?? '');

export const startOfMonth = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), 1);

export const addMonths = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const dayKey = (d: Date): string =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export const formatMonthYear = (d: Date): string =>
  d.toLocaleDateString(undefined, MONTH_YEAR_FORMAT);

export const formatDayHeader = (d: Date): string =>
  d.toLocaleDateString(undefined, DAY_HEADER_FORMAT);

export const formatTime = (d: Date): string =>
  d.toLocaleTimeString(undefined, TIME_FORMAT);

export const isToday = (d: Date): boolean => dayKey(d) === dayKey(new Date());

export const groupEventsByDay = (
  events: CalendarEventInput[],
  month: Date,
): CalendarDayGroup[] => {
  const groups = new Map<string, CalendarDayGroup>();

  events
    .filter(e => isSameMonth(toDate(e.start), month))
    .forEach(e => {
      const date = toDate(e.start);
      const key = dayKey(date);
      const existing = groups.get(key);
      if (existing) {
        existing.events.push(e);
      } else {
        groups.set(key, {
          key,
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          events: [e],
        });
      }
    });

  const sortByStart = (a: CalendarEventInput, b: CalendarEventInput) =>
    toDate(a.start).getTime() - toDate(b.start).getTime();

  return Array.from(groups.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(group => ({ ...group, events: group.events.sort(sortByStart) }));
};
