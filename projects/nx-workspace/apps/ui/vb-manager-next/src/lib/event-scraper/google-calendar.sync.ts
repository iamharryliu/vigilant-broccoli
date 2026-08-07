import { calendar_v3 } from 'googleapis';
import { ScrapedEvent } from './facebook-events.scraper';

const CALENDAR_TIME_ZONE = 'Europe/Stockholm';
const FACEBOOK_EVENT_ID_PREFIX = 'fbevent';
const HTTP_CONFLICT = 409;
const EVENTS_LIST_MAX_RESULTS = 2500;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Facebook renders a narrow no-break space (U+202F), not a regular space,
// between a time and its AM/PM marker — \s matches both, a literal ' ' matches
// only the latter and silently fails to match every real event.
// Numbered rather than named capture groups: tsconfig.base.json targets es2015,
// which predates named groups.
const DATE_TIME_RANGE_PATTERN =
  /^\w+,\s(\w+)\s(\d{1,2}),\s(\d{4})\sat\s(\d{1,2}):(\d{2})\s(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s(AM|PM)/;
const DATE_TIME_SINGLE_PATTERN =
  /^\w+,\s(\w+)\s(\d{1,2}),\s(\d{4})\sat\s(\d{1,2}):(\d{2})\s(AM|PM)/;
// Multi-day events shown with no time and no year, e.g. "Fri, Sep 25 - Sep 26".
const DATE_ONLY_RANGE_PATTERN =
  /^\w+,\s(\w+)\s(\d{1,2})\s*-\s*(?:(\w+)\s)?(\d{1,2})/;
const DEFAULT_EVENT_DURATION_HOURS = 3;

interface EventDateRange {
  start: string;
  end: string;
  allDay?: boolean;
}

const pad = (value: string | number) => String(value).padStart(2, '0');
const to24Hour = (hour: string, period: string) => {
  const hour12 = Number(hour) % 12;
  return period.toUpperCase() === 'PM' ? hour12 + 12 : hour12;
};
const findMonthNumber = (monthText: string) =>
  MONTH_NAMES.findIndex(name => name.startsWith(monthText)) + 1;
const buildLocalDateTime = (
  year: string | number,
  month: number,
  day: string | number,
  hour: number,
  minute: string | number,
) => `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;
const buildDateOnly = (year: number, month: number, day: string | number) =>
  `${year}-${pad(month)}-${pad(day)}`;

const inferYearForMonthDay = (monthNumber: number, day: number) => {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()),
  );
  const candidate = new Date(Date.UTC(now.getFullYear(), monthNumber - 1, day));
  return candidate < today ? now.getFullYear() + 1 : now.getFullYear();
};

interface RangeGroups {
  month: string;
  day: string;
  year: string;
  startHour: string;
  startMinute: string;
  startPeriod: string;
  endHour: string;
  endMinute: string;
  endPeriod: string;
}

interface SingleGroups {
  month: string;
  day: string;
  year: string;
  startHour: string;
  startMinute: string;
  startPeriod: string;
}

interface DateOnlyGroups {
  startMonth: string;
  startDay: string;
  endMonth?: string;
  endDay: string;
}

const buildRangeFromMatch = (groups: RangeGroups): EventDateRange | null => {
  const monthNumber = findMonthNumber(groups.month);
  if (!monthNumber) return null;

  const startHour24 = to24Hour(groups.startHour, groups.startPeriod);
  const endHour24 = to24Hour(groups.endHour, groups.endPeriod);

  let endYear = Number(groups.year);
  let endMonth = monthNumber;
  let endDay = Number(groups.day);
  if (
    endHour24 * 60 + Number(groups.endMinute) <=
    startHour24 * 60 + Number(groups.startMinute)
  ) {
    const nextDay = new Date(Date.UTC(endYear, endMonth - 1, endDay + 1));
    endYear = nextDay.getUTCFullYear();
    endMonth = nextDay.getUTCMonth() + 1;
    endDay = nextDay.getUTCDate();
  }

  return {
    start: buildLocalDateTime(
      groups.year,
      monthNumber,
      groups.day,
      startHour24,
      groups.startMinute,
    ),
    end: buildLocalDateTime(
      endYear,
      endMonth,
      endDay,
      endHour24,
      groups.endMinute,
    ),
  };
};

const buildDefaultDurationRange = (
  groups: SingleGroups,
): EventDateRange | null => {
  const monthNumber = findMonthNumber(groups.month);
  if (!monthNumber) return null;

  const startHour24 = to24Hour(groups.startHour, groups.startPeriod);
  const endDate = new Date(
    Date.UTC(
      Number(groups.year),
      monthNumber - 1,
      Number(groups.day),
      startHour24 + DEFAULT_EVENT_DURATION_HOURS,
      Number(groups.startMinute),
    ),
  );

  return {
    start: buildLocalDateTime(
      groups.year,
      monthNumber,
      groups.day,
      startHour24,
      groups.startMinute,
    ),
    end: buildLocalDateTime(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth() + 1,
      endDate.getUTCDate(),
      endDate.getUTCHours(),
      endDate.getUTCMinutes(),
    ),
  };
};

const buildDateOnlyRange = (groups: DateOnlyGroups): EventDateRange | null => {
  const startMonthNumber = findMonthNumber(groups.startMonth);
  const endMonthNumber = findMonthNumber(groups.endMonth ?? groups.startMonth);
  if (!startMonthNumber || !endMonthNumber) return null;

  const startYear = inferYearForMonthDay(
    startMonthNumber,
    Number(groups.startDay),
  );
  const endYear = endMonthNumber < startMonthNumber ? startYear + 1 : startYear;

  // Calendar's all-day end.date is exclusive — the day after the last day.
  const endExclusive = new Date(
    Date.UTC(endYear, endMonthNumber - 1, Number(groups.endDay) + 1),
  );

  return {
    allDay: true,
    start: buildDateOnly(startYear, startMonthNumber, groups.startDay),
    end: buildDateOnly(
      endExclusive.getUTCFullYear(),
      endExclusive.getUTCMonth() + 1,
      endExclusive.getUTCDate(),
    ),
  };
};

export const parseEventDateTimeRange = (
  dateTimeText: string,
): EventDateRange | null => {
  const rangeMatch = dateTimeText.match(DATE_TIME_RANGE_PATTERN);
  if (rangeMatch) {
    const [
      ,
      month,
      day,
      year,
      startHour,
      startMinute,
      startPeriod,
      endHour,
      endMinute,
      endPeriod,
    ] = rangeMatch;
    return buildRangeFromMatch({
      month,
      day,
      year,
      startHour,
      startMinute,
      startPeriod,
      endHour,
      endMinute,
      endPeriod,
    });
  }

  const singleMatch = dateTimeText.match(DATE_TIME_SINGLE_PATTERN);
  if (singleMatch) {
    const [, month, day, year, startHour, startMinute, startPeriod] =
      singleMatch;
    return buildDefaultDurationRange({
      month,
      day,
      year,
      startHour,
      startMinute,
      startPeriod,
    });
  }

  const dateOnlyMatch = dateTimeText.match(DATE_ONLY_RANGE_PATTERN);
  if (dateOnlyMatch) {
    const [, startMonth, startDay, endMonth, endDay] = dateOnlyMatch;
    return buildDateOnlyRange({ startMonth, startDay, endMonth, endDay });
  }

  return null;
};

const buildCalendarEventId = (facebookEventId: string) =>
  `${FACEBOOK_EVENT_ID_PREFIX}${facebookEventId}`;

const buildEventRequestBody = (
  event: ScrapedEvent,
  range: EventDateRange,
): calendar_v3.Schema$Event => ({
  id: buildCalendarEventId(event.id),
  summary: event.title,
  description: [event.description, event.url].filter(Boolean).join('\n\n'),
  location: event.location,
  start: range.allDay
    ? { date: range.start }
    : { dateTime: range.start, timeZone: CALENDAR_TIME_ZONE },
  end: range.allDay
    ? { date: range.end }
    : { dateTime: range.end, timeZone: CALENDAR_TIME_ZONE },
});

const upsertEvent = async (
  calendar: calendar_v3.Calendar,
  calendarId: string,
  event: ScrapedEvent,
  range: EventDateRange,
) => {
  const requestBody = buildEventRequestBody(event, range);
  try {
    await calendar.events.insert({ calendarId, requestBody });
  } catch (error) {
    if ((error as { code?: number }).code !== HTTP_CONFLICT) throw error;
    await calendar.events.update({
      calendarId,
      eventId: requestBody.id as string,
      requestBody,
    });
  }
};

const deleteStaleEvents = async (
  calendar: calendar_v3.Calendar,
  calendarId: string,
  currentEventIds: Set<string>,
) => {
  const { data } = await calendar.events.list({
    calendarId,
    showDeleted: false,
    maxResults: EVENTS_LIST_MAX_RESULTS,
  });

  const staleEvents = (data.items || []).filter(
    item =>
      item.id?.startsWith(FACEBOOK_EVENT_ID_PREFIX) &&
      !currentEventIds.has(item.id),
  );

  for (const staleEvent of staleEvents) {
    await calendar.events.delete({
      calendarId,
      eventId: staleEvent.id as string,
    });
  }
  return staleEvents.length;
};

export const syncEventsToCalendar = async (
  calendar: calendar_v3.Calendar,
  calendarId: string,
  events: ScrapedEvent[],
) => {
  const syncedEventIds = new Set<string>();
  let skipped = 0;

  for (const event of events) {
    const range = event.dateTime
      ? parseEventDateTimeRange(event.dateTime)
      : null;
    if (!range) {
      skipped++;
      continue;
    }
    await upsertEvent(calendar, calendarId, event, range);
    syncedEventIds.add(buildCalendarEventId(event.id));
  }

  const removed = await deleteStaleEvents(calendar, calendarId, syncedEventIds);

  return { synced: syncedEventIds.size, skipped, removed };
};
