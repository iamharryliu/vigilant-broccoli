import type { ResumeData } from './resume.types';

export interface ResumeExperienceSummary {
  totalMonths: number;
  fullYears: number;
  remainderMonths: number;
  skippedRoles: string[];
}

const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];
const PRESENT_PATTERN = /^(present|current|now)$/i;
const MONTHS_PER_YEAR = 12;

const parseMonthIndex = (text: string, now: Date): number | undefined => {
  const trimmed = text.trim();
  if (PRESENT_PATTERN.test(trimmed)) {
    return now.getFullYear() * MONTHS_PER_YEAR + now.getMonth();
  }
  const [monthName, year] = trimmed.split(/\s+/);
  const month = MONTHS.indexOf(monthName?.toLowerCase() ?? '');
  const yearNumber = Number(year);
  if (month < 0 || !Number.isInteger(yearNumber)) return undefined;
  return yearNumber * MONTHS_PER_YEAR + month;
};

/**
 * Conservative: overlapping roles are merged so no month counts twice, gaps are
 * excluded, and each month boundary is counted exclusively (March 2025 to
 * August 2025 is 5 months).
 */
export const calculateWorkExperience = (
  resume: ResumeData,
  now: Date = new Date(),
): ResumeExperienceSummary => {
  const skippedRoles: string[] = [];
  const intervals = resume.workExperience
    .flatMap(entry => {
      const start = parseMonthIndex(entry.startDate, now);
      const end = parseMonthIndex(entry.endDate, now);
      if (start === undefined || end === undefined || end < start) {
        skippedRoles.push(`${entry.company} - ${entry.role}`);
        return [];
      }
      return [[start, end] as const];
    })
    .sort((a, b) => a[0] - b[0]);

  let totalMonths = 0;
  let coveredUntil = -Infinity;
  for (const [start, end] of intervals) {
    const effectiveStart = Math.max(start, coveredUntil);
    if (end > effectiveStart) totalMonths += end - effectiveStart;
    coveredUntil = Math.max(coveredUntil, end);
  }

  return {
    totalMonths,
    fullYears: Math.floor(totalMonths / MONTHS_PER_YEAR),
    remainderMonths: totalMonths % MONTHS_PER_YEAR,
    skippedRoles,
  };
};
