import {
  addDays,
  addHours,
  buildExternalEventId,
  CALENDAR_TIME_ZONE,
  DEFAULT_EVENT_DURATION_HOURS,
  formatDateOnly,
  formatLocalDateTime,
  isValidTimeZone,
  zonedTimeToInstant,
} from './event-time';
import { ScrapedEvent } from './scraped-event.types';

const FETCH_TIMEOUT_MS = 30000;
const DAY_MS = 24 * 60 * 60 * 1000;
const SECTION_UPCOMING = 'upcoming';
const STATUS_CANCELLED = 'CANCELLED';
const WEBCAL_PROTOCOL = /^webcal:/i;
const VALUE_DATE = 'DATE';
const DATE_PATTERN = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/;

interface IcalProperty {
  params: Record<string, string>;
  value: string;
}

type IcalEvent = Record<string, IcalProperty>;

export const normalizeFeedUrl = (url: string) =>
  url.replace(WEBCAL_PROTOCOL, 'https:');

const unescapeText = (value: string) =>
  value.replace(/\\([nN,;\\])/g, (_, char: string) =>
    char.toLowerCase() === 'n' ? '\n' : char,
  );

const parseProperty = (line: string): [string, IcalProperty] | null => {
  const separator = line.indexOf(':');
  if (separator < 0) return null;
  const [name, ...rawParams] = line.slice(0, separator).split(';');
  const params = Object.fromEntries(
    rawParams.map(param => {
      const [key, value = ''] = param.split('=');
      return [key.toUpperCase(), value.replace(/^"|"$/g, '')];
    }),
  );
  return [name.toUpperCase(), { params, value: line.slice(separator + 1) }];
};

// Recurrence rules are not expanded: a recurring event contributes its first
// occurrence only. Feeds that list every occurrence as its own VEVENT (the
// common case for venue calendars) are unaffected.
const parseIcalEvents = (text: string): IcalEvent[] => {
  const lines = text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
  const events: IcalEvent[] = [];
  let current: IcalEvent | null = null;
  // A VEVENT's VALARM has its own DESCRIPTION that must not overwrite the
  // event's.
  let alarmDepth = 0;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') current = {};
    else if (line === 'END:VEVENT') {
      if (current) events.push(current);
      current = null;
    } else if (current && line === 'BEGIN:VALARM') alarmDepth++;
    else if (current && line === 'END:VALARM') alarmDepth--;
    else if (current && !alarmDepth) {
      const property = parseProperty(line);
      if (property && !(property[0] in current)) {
        current[property[0]] = property[1];
      }
    }
  }
  return events;
};

interface ParsedMoment {
  allDay: boolean;
  // UTC milliseconds of the calendar date for all-day values; the real
  // instant otherwise.
  value: number;
}

const parseMoment = (property?: IcalProperty): ParsedMoment | null => {
  const match = property?.value.match(DATE_PATTERN);
  if (!property || !match) return null;
  const [, year, month, day, hour, minute, second, utc] = match;
  const wallClock = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour ?? 0),
    Number(minute ?? 0),
    Number(second ?? 0),
  );
  if (hour === undefined || property.params.VALUE === VALUE_DATE) {
    return { allDay: true, value: wallClock };
  }
  if (utc) return { allDay: false, value: wallClock };
  const timeZone = isValidTimeZone(property.params.TZID ?? '')
    ? property.params.TZID
    : CALENDAR_TIME_ZONE;
  return { allDay: false, value: zonedTimeToInstant(wallClock, timeZone) };
};

const toScrapedEvent = (
  event: IcalEvent,
  feedUrl: string,
): ScrapedEvent | null => {
  if (event.STATUS?.value.toUpperCase() === STATUS_CANCELLED) return null;
  const start = parseMoment(event.DTSTART);
  const title = event.SUMMARY && unescapeText(event.SUMMARY.value).trim();
  if (!start || !title) return null;

  const end = parseMoment(event.DTEND);
  const common = {
    id: buildExternalEventId(
      event.UID?.value ?? title,
      event['RECURRENCE-ID']?.value ?? event.DTSTART.value,
    ),
    external: true,
    title,
    location: event.LOCATION && unescapeText(event.LOCATION.value),
    description: event.DESCRIPTION && unescapeText(event.DESCRIPTION.value),
    section: SECTION_UPCOMING,
    url: event.URL?.value ?? feedUrl,
  };

  if (start.allDay) {
    const endValue = end?.allDay ? end.value : addDays(start.value, 1);
    return {
      ...common,
      allDay: true,
      start: formatDateOnly(start.value),
      end: formatDateOnly(Math.max(endValue, addDays(start.value, 1))),
    };
  }

  const endInstant =
    end && !end.allDay
      ? end.value
      : addHours(start.value, DEFAULT_EVENT_DURATION_HOURS);
  return {
    ...common,
    start: formatLocalDateTime(start.value),
    end: formatLocalDateTime(endInstant),
  };
};

// start/end are wall-clock strings, so compare with a day of slack rather than
// converting back to an instant; stale-event deletion only looks at upcoming
// events anyway.
const hasNotEnded = (event: ScrapedEvent) =>
  new Date(event.end ?? event.start ?? 0).getTime() >= Date.now() - DAY_MS;

export const parseIcalFeed = (text: string, feedUrl: string) =>
  parseIcalEvents(text)
    .map(event => toScrapedEvent(event, feedUrl))
    .filter((event): event is ScrapedEvent => !!event)
    .filter(hasNotEnded);

export const scrapeIcalEvents = async ({
  feedUrl,
}: {
  feedUrl: string;
}): Promise<ScrapedEvent[]> => {
  const url = normalizeFeedUrl(feedUrl);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Calendar feed ${url} returned ${response.status}`);
  }
  return parseIcalFeed(await response.text(), url);
};
