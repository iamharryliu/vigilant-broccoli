import type { EmployeeAbsence } from '@vigilant-broccoli/employee-handler';

export const DAY_MS = 86400000;
const MAX_SLOT = 7;

export const parseDate = (s: string): Date =>
  new Date(`${s.slice(0, 10)}T00:00:00Z`);

export const fmtDate = (d: Date): string => d.toISOString().slice(0, 10);

export const fmtMonth = (d: Date): string =>
  d.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

export const daysBetween = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / DAY_MS);

export const addDays = (d: Date, n: number): Date =>
  new Date(d.getTime() + n * DAY_MS);

export const startOfMonth = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

export const addMonths = (d: Date, n: number): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));

// Fixed 8-hue categorical palette (dataviz default: assigned in fixed order,
// never cycled — anything past slot 7 folds into a shared "Other" bucket).
export const buildTypeSlots = (typeNames: string[]): Map<string, number> => {
  const sorted = [...new Set(typeNames)].sort((a, b) => a.localeCompare(b));
  const slotForType = new Map<string, number>();
  sorted.forEach((name, i) => slotForType.set(name, Math.min(i, MAX_SLOT)));
  return slotForType;
};

export type AbsenceWithLayout = EmployeeAbsence & {
  slot: number;
  startD: Date;
  endD: Date;
};

export type EmployeeGroup = {
  email: string;
  name: string;
  absences: AbsenceWithLayout[];
};

export const groupByEmployee = (
  absences: EmployeeAbsence[],
): EmployeeGroup[] => {
  const slotForType = buildTypeSlots(absences.map(a => a.type));
  const byEmail = new Map<string, EmployeeGroup>();
  for (const a of absences) {
    if (!byEmail.has(a.employeeEmail)) {
      byEmail.set(a.employeeEmail, {
        email: a.employeeEmail,
        name: a.employeeName || a.employeeEmail,
        absences: [],
      });
    }
    byEmail.get(a.employeeEmail)?.absences.push({
      ...a,
      slot: slotForType.get(a.type) ?? MAX_SLOT,
      startD: parseDate(a.startDate),
      endD: parseDate(a.endDate),
    });
  }
  const groups = [...byEmail.values()];
  groups.forEach(g =>
    g.absences.sort((x, y) => x.startD.getTime() - y.startD.getTime()),
  );
  groups.sort((a, b) => a.name.localeCompare(b.name));
  return groups;
};

export type DateRange = { rangeStart: Date; rangeEnd: Date; pxPerDay: number };

const WINDOW_PADDING_DAYS = 30;
const RANGE_MARGIN_DAYS = 14;
const DENSE_RANGE_THRESHOLD_DAYS = 500;

export const computeRange = (
  groups: EmployeeGroup[],
  today: Date,
): DateRange => {
  let start = today.getTime() - WINDOW_PADDING_DAYS * DAY_MS;
  let end = today.getTime() + WINDOW_PADDING_DAYS * DAY_MS;
  for (const g of groups) {
    for (const a of g.absences) {
      start = Math.min(start, a.startD.getTime());
      end = Math.max(end, a.endD.getTime());
    }
  }
  const rangeStart = startOfMonth(addDays(new Date(start), -RANGE_MARGIN_DAYS));
  const rangeEnd = addDays(new Date(end), RANGE_MARGIN_DAYS);
  const totalDays = daysBetween(rangeStart, rangeEnd);
  const pxPerDay = totalDays > DENSE_RANGE_THRESHOLD_DAYS ? 3 : 6;
  return { rangeStart, rangeEnd, pxPerDay };
};

export type MonthMark = { left: number; label: string; isJan: boolean };

export const buildMonths = (
  rangeStart: Date,
  rangeEnd: Date,
  pxPerDay: number,
): MonthMark[] => {
  const months: MonthMark[] = [];
  let month = startOfMonth(rangeStart);
  while (month <= rangeEnd) {
    const offsetDays = daysBetween(rangeStart, month);
    if (offsetDays >= 0) {
      months.push({
        left: Math.round(offsetDays * pxPerDay),
        label: fmtMonth(month),
        isJan: month.getUTCMonth() === 0,
      });
    }
    month = addMonths(month, 1);
  }
  return months;
};

export type LegendEntry = { slot: number; label: string };

export const buildLegend = (groups: EmployeeGroup[]): LegendEntry[] => {
  const bySlot = new Map<number, string>();
  for (const g of groups) {
    for (const a of g.absences) {
      if (!bySlot.has(a.slot)) bySlot.set(a.slot, a.type);
    }
  }
  const entries = [...bySlot.entries()]
    .sort(([a], [b]) => a - b)
    .map(([slot, label]) => ({ slot, label }));
  const overflowCount = entries.filter(e => e.slot === MAX_SLOT).length;
  return entries.map(e =>
    e.slot === MAX_SLOT && overflowCount > 1 ? { ...e, label: 'Other' } : e,
  );
};
