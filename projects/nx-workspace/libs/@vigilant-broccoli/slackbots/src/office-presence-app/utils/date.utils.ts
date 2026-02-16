import { MONTHS, WEEKDAYS } from '../consts/data.consts';

export function formatDateShort(date: Date): string {
  const dayName = WEEKDAYS[date.getDay()];
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${dayName} ${d}/${m}`;
}

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

export function getUpcomingWeekdays(numDays = 10): Date[] {
  const today = new Date();
  const days: Date[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = addDays(today, i);
    const day = d.getDay();
    if (day >= 1 && day <= 5) {
      days.push(d);
    }
  }
  return days;
}
