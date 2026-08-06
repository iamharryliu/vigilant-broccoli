// Usage:
//   node sync-google-calendar.mjs [inputFile]   (default: events.out.json)
//
// Upserts scraped events into a dedicated "Malmö Latin Dance Events" Google
// Calendar — never an existing calendar. The calendar is owned by a Google
// service account (GOOGLE_CALENDAR_SA_CREDENTIALS, Terraform-managed — see
// infrastructure/terraform/main.tf's google_calendar_manager resources) and
// shared back to a personal account, since personal Gmail accounts have no
// Workspace domain to grant domain-wide delegation over. Looked up by name
// each run rather than cached locally, so there's no local state to desync.
//
// Calendar events use a deterministic ID derived from the Facebook event ID,
// so reruns update in place instead of duplicating, and events no longer
// present in the input are removed from the calendar.

import { google } from 'googleapis';
import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const GCP_PROJECT = 'vigilant-broccoli';
const CALENDAR_SA_SECRET_NAME = 'GOOGLE_CALENDAR_SA_CREDENTIALS';
const CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar'];

const CALENDAR_NAME = 'Malmö Latin Dance Events';
const CALENDAR_TIME_ZONE = 'Europe/Stockholm';
const SHARE_WITH_EMAIL = 'harryliu1995@gmail.com';
const CALENDAR_SHARE_ROLE = 'owner';

const DEFAULT_INPUT_PATH = 'events.out.json';
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
const DATE_TIME_RANGE_PATTERN =
  /^\w+,\s(?<month>\w+)\s(?<day>\d{1,2}),\s(?<year>\d{4})\sat\s(?<startHour>\d{1,2}):(?<startMinute>\d{2})\s(?<startPeriod>AM|PM)\s*[–-]\s*(?<endHour>\d{1,2}):(?<endMinute>\d{2})\s(?<endPeriod>AM|PM)/;

// Falls back to this for events Facebook shows with only a start time
// (no " – end time" range).
const DATE_TIME_SINGLE_PATTERN =
  /^\w+,\s(?<month>\w+)\s(?<day>\d{1,2}),\s(?<year>\d{4})\sat\s(?<startHour>\d{1,2}):(?<startMinute>\d{2})\s(?<startPeriod>AM|PM)/;
const DEFAULT_EVENT_DURATION_HOURS = 3;

// Multi-day events with no per-day time shown at all, e.g. "Fri, Sep 25 - Sep 26"
// — no year either, so the year is inferred from the current date.
const DATE_ONLY_RANGE_PATTERN =
  /^\w+,\s(?<startMonth>\w+)\s(?<startDay>\d{1,2})\s*-\s*(?:(?<endMonth>\w+)\s)?(?<endDay>\d{1,2})/;

const pad = n => String(n).padStart(2, '0');
const to24Hour = (hour, period) => {
  const hour12 = Number(hour) % 12;
  return period.toUpperCase() === 'PM' ? hour12 + 12 : hour12;
};
const findMonthNumber = monthText => MONTH_NAMES.findIndex(name => name.startsWith(monthText)) + 1;
const buildLocalDateTime = (year, month, day, hour, minute) =>
  `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;
const buildDateOnly = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

// Facebook only ever shows these for the upcoming event this script scrapes,
// so the current year is the right guess unless that month/day already
// passed this year — then it must mean next year.
const inferYearForMonthDay = (monthNumber, day) => {
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const candidate = new Date(Date.UTC(now.getFullYear(), monthNumber - 1, day));
  return candidate < today ? now.getFullYear() + 1 : now.getFullYear();
};

const buildRangeFromMatch = groups => {
  const { month, day, year, startHour, startMinute, startPeriod, endHour, endMinute, endPeriod } = groups;
  const monthNumber = findMonthNumber(month);
  if (!monthNumber) return null;

  const startHour24 = to24Hour(startHour, startPeriod);
  const endHour24 = to24Hour(endHour, endPeriod);

  let endYear = Number(year);
  let endMonth = monthNumber;
  let endDay = Number(day);
  if (endHour24 * 60 + Number(endMinute) <= startHour24 * 60 + Number(startMinute)) {
    const nextDay = new Date(Date.UTC(endYear, endMonth - 1, endDay + 1));
    endYear = nextDay.getUTCFullYear();
    endMonth = nextDay.getUTCMonth() + 1;
    endDay = nextDay.getUTCDate();
  }

  return {
    start: buildLocalDateTime(year, monthNumber, day, startHour24, startMinute),
    end: buildLocalDateTime(endYear, endMonth, endDay, endHour24, endMinute),
  };
};

const buildDefaultDurationRange = groups => {
  const { month, day, year, startHour, startMinute, startPeriod } = groups;
  const monthNumber = findMonthNumber(month);
  if (!monthNumber) return null;

  const startHour24 = to24Hour(startHour, startPeriod);
  const endDate = new Date(
    Date.UTC(Number(year), monthNumber - 1, Number(day), startHour24 + DEFAULT_EVENT_DURATION_HOURS, Number(startMinute)),
  );

  return {
    start: buildLocalDateTime(year, monthNumber, day, startHour24, startMinute),
    end: buildLocalDateTime(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth() + 1,
      endDate.getUTCDate(),
      endDate.getUTCHours(),
      endDate.getUTCMinutes(),
    ),
  };
};

const buildDateOnlyRange = groups => {
  const { startMonth, startDay, endMonth, endDay } = groups;
  const startMonthNumber = findMonthNumber(startMonth);
  const endMonthNumber = findMonthNumber(endMonth ?? startMonth);
  if (!startMonthNumber || !endMonthNumber) return null;

  const startYear = inferYearForMonthDay(startMonthNumber, Number(startDay));
  const endYear = endMonthNumber < startMonthNumber ? startYear + 1 : startYear;

  // Calendar's all-day `end.date` is exclusive — the day after the last day.
  const endExclusive = new Date(Date.UTC(endYear, endMonthNumber - 1, Number(endDay) + 1));

  return {
    allDay: true,
    start: buildDateOnly(startYear, startMonthNumber, startDay),
    end: buildDateOnly(endExclusive.getUTCFullYear(), endExclusive.getUTCMonth() + 1, endExclusive.getUTCDate()),
  };
};

const parseEventDateTimeRange = dateTimeText => {
  const rangeMatch = dateTimeText.match(DATE_TIME_RANGE_PATTERN);
  if (rangeMatch) return buildRangeFromMatch(rangeMatch.groups);

  const singleMatch = dateTimeText.match(DATE_TIME_SINGLE_PATTERN);
  if (singleMatch) return buildDefaultDurationRange(singleMatch.groups);

  const dateOnlyMatch = dateTimeText.match(DATE_ONLY_RANGE_PATTERN);
  if (dateOnlyMatch) return buildDateOnlyRange(dateOnlyMatch.groups);

  return null;
};

const fetchServiceAccountCredentials = () => {
  const base64Json = execSync(
    `gcloud secrets versions access latest --secret=${CALENDAR_SA_SECRET_NAME} --project=${GCP_PROJECT}`,
    { encoding: 'utf8' },
  );
  return JSON.parse(Buffer.from(base64Json.trim(), 'base64').toString('utf-8'));
};

const createCalendarClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: fetchServiceAccountCredentials(),
    scopes: CALENDAR_SCOPES,
  });
  return google.calendar({ version: 'v3', auth });
};

const findOrCreateCalendar = async calendar => {
  const { data } = await calendar.calendarList.list();
  const existing = data.items?.find(item => item.summary === CALENDAR_NAME);
  if (existing) return existing.id;

  const { data: created } = await calendar.calendars.insert({
    requestBody: { summary: CALENDAR_NAME, timeZone: CALENDAR_TIME_ZONE },
  });

  await calendar.acl.insert({
    calendarId: created.id,
    requestBody: { role: CALENDAR_SHARE_ROLE, scope: { type: 'user', value: SHARE_WITH_EMAIL } },
  });

  console.error(`Created calendar "${CALENDAR_NAME}" (${created.id}) and shared it with ${SHARE_WITH_EMAIL}`);
  return created.id;
};

const buildCalendarEventId = facebookEventId => `${FACEBOOK_EVENT_ID_PREFIX}${facebookEventId}`;

const buildEventRequestBody = (event, range) => ({
  id: buildCalendarEventId(event.id),
  summary: event.title,
  description: [event.description, event.url].filter(Boolean).join('\n\n'),
  location: event.location,
  start: range.allDay ? { date: range.start } : { dateTime: range.start, timeZone: CALENDAR_TIME_ZONE },
  end: range.allDay ? { date: range.end } : { dateTime: range.end, timeZone: CALENDAR_TIME_ZONE },
});

const upsertEvent = async (calendar, calendarId, event, range) => {
  const requestBody = buildEventRequestBody(event, range);
  try {
    await calendar.events.insert({ calendarId, requestBody });
  } catch (error) {
    if (error.code !== HTTP_CONFLICT) throw error;
    await calendar.events.update({ calendarId, eventId: requestBody.id, requestBody });
  }
};

const deleteStaleEvents = async (calendar, calendarId, currentEventIds) => {
  const { data } = await calendar.events.list({
    calendarId,
    showDeleted: false,
    maxResults: EVENTS_LIST_MAX_RESULTS,
  });

  const staleEvents = (data.items || []).filter(
    item => item.id?.startsWith(FACEBOOK_EVENT_ID_PREFIX) && !currentEventIds.has(item.id),
  );

  for (const staleEvent of staleEvents) {
    await calendar.events.delete({ calendarId, eventId: staleEvent.id });
    console.error(`Removed stale event: ${staleEvent.summary}`);
  }
};

const runSync = async inputPath => {
  const events = JSON.parse(await readFile(inputPath, 'utf8'));
  const calendar = createCalendarClient();
  const calendarId = await findOrCreateCalendar(calendar);

  const syncedEventIds = new Set();
  let skipped = 0;

  for (const event of events) {
    const range = event.dateTime ? parseEventDateTimeRange(event.dateTime) : null;
    if (!range) {
      console.error(`Skipping "${event.title}" — could not parse date/time: ${event.dateTime ?? '(none)'}`);
      skipped++;
      continue;
    }

    await upsertEvent(calendar, calendarId, event, range);
    syncedEventIds.add(buildCalendarEventId(event.id));
  }

  await deleteStaleEvents(calendar, calendarId, syncedEventIds);

  console.log(`Synced ${syncedEventIds.size} events to "${CALENDAR_NAME}"${skipped ? ` (${skipped} skipped)` : ''}`);
};

runSync(process.argv[2] ?? DEFAULT_INPUT_PATH);
