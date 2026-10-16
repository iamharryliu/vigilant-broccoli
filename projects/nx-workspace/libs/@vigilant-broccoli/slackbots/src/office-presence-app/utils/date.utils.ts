import { MONTHS, WEEKDAYS } from '../consts/data.consts';

export function formatDateLong(date: Date): string {
  const dayName = WEEKDAYS[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = MONTHS[date.getMonth()];
  return `${dayName}, ${dayNumber} ${monthName}`;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function formatISODateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getUpcomingWeekdays(
  numDays = 10,
  includeWeekends = false,
): Date[] {
  const today = new Date();
  const days: Date[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = addDays(today, i);
    const day = d.getDay();
    if (includeWeekends || (day >= 1 && day <= 5)) {
      days.push(d);
    }
  }
  return days;
}

// `en-CA` formats as YYYY-MM-DD.
export function formatISODateInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(date);
}

const MS_PER_DAY = 86400000;

const shiftISODate = (isoDate: string, days: number): string =>
  new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);

// ISO weeks start on Monday; weekOffset 0 is the week containing `todayISO`.
export function getWeekDates(
  todayISO: string,
  weekOffset: number,
  includeWeekends = false,
): string[] {
  const weekday = new Date(`${todayISO}T00:00:00Z`).getUTCDay() || 7;
  const monday = shiftISODate(todayISO, 1 - weekday + weekOffset * 7);
  const dayCount = includeWeekends ? 7 : 5;
  return Array.from({ length: dayCount }, (_, i) => shiftISODate(monday, i));
}

export function getWeekStart(todayISO: string): string {
  return getWeekDates(todayISO, 0, true)[0];
}
