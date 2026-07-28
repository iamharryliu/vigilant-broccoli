import { LeaderboardMetricFormat } from './leaderboard.types';

export function formatCompactNumber(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000) {
    const formatted = (absValue / 1_000_000).toFixed(
      absValue % 1_000_000 === 0 ? 0 : 1,
    );
    return `${sign}${formatted.replace(/\.0$/, '')}M`;
  }
  if (absValue >= 1_000) {
    const formatted = (absValue / 1_000).toFixed(
      absValue % 1_000 === 0 ? 0 : 1,
    );
    return `${sign}${formatted.replace(/\.0$/, '')}K`;
  }
  return `${sign}${absValue}`;
}

export function formatDuration(nanoSeconds: number): string {
  const seconds = nanoSeconds / 1000;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;

  return `${mins}m ${secs}s`;
}

export function formatMetricValue(
  value: number,
  format: LeaderboardMetricFormat = 'integer',
): string {
  switch (format) {
    case 'decimal1':
      return value.toFixed(1);
    case 'duration':
      return formatDuration(Math.round(value));
    case 'compact':
      return formatCompactNumber(Math.round(value));
    case 'integer':
    default:
      return String(Math.round(value));
  }
}
