import { MONTHS, WEEKDAYS } from '../consts/data.consts';

const MS_PER_DAY = 86400000;
const SATURDAY = 6;

// Dates are ISO strings read at UTC midnight, so the server's own timezone never shifts a day.
const toUTCDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

export function formatDateLong(isoDate: string): string {
  const date = toUTCDate(isoDate);
  const dayName = WEEKDAYS[date.getUTCDay()];
  const monthName = MONTHS[date.getUTCMonth()];
  return `${dayName}, ${date.getUTCDate()} ${monthName}`;
}

// ISO weekday: Monday is 1, Sunday is 7.
export const getISOWeekday = (isoDate: string): number =>
  toUTCDate(isoDate).getUTCDay() || 7;

export function getWeekNumber(isoDate: string): number {
  const d = toUTCDate(isoDate);
  d.setUTCDate(d.getUTCDate() + 4 - getISOWeekday(isoDate));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
}

// `en-CA` formats as YYYY-MM-DD.
export function formatISODateInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
}

export const shiftISODate = (isoDate: string, days: number): string =>
  new Date(toUTCDate(isoDate).getTime() + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);

// The next `numDays` calendar days starting at `todayISO`, weekends dropped unless included.
export function getUpcomingWeekdays(
  todayISO: string,
  numDays = 10,
  includeWeekends = false,
): string[] {
  return Array.from({ length: numDays }, (_, i) =>
    shiftISODate(todayISO, i),
  ).filter(date => includeWeekends || getISOWeekday(date) < SATURDAY);
}

// ISO weeks start on Monday; weekOffset 0 is the week containing `todayISO`.
export function getWeekDates(
  todayISO: string,
  weekOffset: number,
  includeWeekends = false,
): string[] {
  const monday = shiftISODate(
    todayISO,
    1 - getISOWeekday(todayISO) + weekOffset * 7,
  );
  const dayCount = includeWeekends ? 7 : 5;
  return Array.from({ length: dayCount }, (_, i) => shiftISODate(monday, i));
}

export function getWeekStart(todayISO: string): string {
  return getWeekDates(todayISO, 0, true)[0];
}
