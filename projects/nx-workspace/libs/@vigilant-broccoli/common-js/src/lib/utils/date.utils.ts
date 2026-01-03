/**
 * Calculate the ISO week number for a given date.
 * ISO week date system: weeks start on Monday, and week 1 is the week with the first Thursday of the year.
 *
 * @param date - The date to calculate the week number for (defaults to current date)
 * @returns The ISO week number (1-53)
 */
export function getISOWeekNumber(date: Date = new Date()): number {
  // Create a copy to avoid modifying the original date
  const targetDate = new Date(date.getTime());
  targetDate.setHours(0, 0, 0, 0);

  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  targetDate.setDate(targetDate.getDate() + 4 - (targetDate.getDay() || 7));

  // Get first day of year
  const yearStart = new Date(targetDate.getFullYear(), 0, 1);

  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((targetDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return weekNo;
}
