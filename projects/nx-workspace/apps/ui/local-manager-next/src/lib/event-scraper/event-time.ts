import { createHash } from 'crypto';

export const CALENDAR_TIME_ZONE = 'Europe/Stockholm';
export const DEFAULT_EVENT_DURATION_HOURS = 3;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const EXTERNAL_ID_LENGTH = 32;

const pad = (value: number) => String(value).padStart(2, '0');

const getPart = (parts: Intl.DateTimeFormatPart[], type: string) =>
  Number(parts.find(part => part.type === type)?.value);

const zonedParts = (instant: number, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(new Date(instant));
  return {
    year: getPart(parts, 'year'),
    month: getPart(parts, 'month'),
    day: getPart(parts, 'day'),
    hour: getPart(parts, 'hour'),
    minute: getPart(parts, 'minute'),
    second: getPart(parts, 'second'),
  };
};

export const formatLocalDateTime = (instant: number) => {
  const { year, month, day, hour, minute, second } = zonedParts(
    instant,
    CALENDAR_TIME_ZONE,
  );
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
};

export const formatDateOnly = (utcMs: number) =>
  new Date(utcMs).toISOString().slice(0, 10);

const offsetMs = (instant: number, timeZone: string) => {
  const { year, month, day, hour, minute, second } = zonedParts(
    instant,
    timeZone,
  );
  return Date.UTC(year, month - 1, day, hour, minute, second) - instant;
};

// Wall-clock time in an IANA zone to an instant. The second pass corrects the
// guess when the zone's offset differs at the guessed instant (DST boundary).
export const zonedTimeToInstant = (
  wallClockUtcMs: number,
  timeZone: string,
) => {
  const firstGuess = wallClockUtcMs - offsetMs(wallClockUtcMs, timeZone);
  return wallClockUtcMs - offsetMs(firstGuess, timeZone);
};

export const isValidTimeZone = (timeZone: string) => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
};

export const addHours = (instant: number, hours: number) =>
  instant + hours * HOUR_MS;

export const addDays = (utcMs: number, days: number) => utcMs + days * DAY_MS;

// Google Calendar event ids only allow a-v and 0-9; hex digests fit.
export const buildExternalEventId = (...parts: string[]) =>
  createHash('sha256')
    .update(parts.join('\n'))
    .digest('hex')
    .slice(0, EXTERNAL_ID_LENGTH);
