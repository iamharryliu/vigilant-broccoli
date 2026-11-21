import { CalendarParseResult } from '@vigilant-broccoli/llm-schemas';

type ParsedEvent = CalendarParseResult['events'][number];

export type CalendarEvent = {
  summary: string;
  description: string;
  location: string;
  start: string;
  end: string;
  timeZone: string;
  allDay: boolean;
  recurrence: string[];
};

const MS_PER_MINUTE = 60_000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(:\d{2})?/;

export const buildSystemPrompt = (timeZone: string) => {
  const now = new Date();
  return `You extract calendar events from text and images (screenshots of invites, posters, emails, messages, itineraries).

Return JSON matching the schema: { "events": [ ... ] }. Include one entry per distinct event. If no event is present, return an empty array.

Multi-event rules:
- A single page often describes more than one event. Extract every one of them, including sessions described only in body prose, in a trailing paragraph, or under a heading aimed at a different audience.
- Sessions that differ in start/end time, age limit, target audience, or format are distinct events even when they share a title, venue and date range. Never merge them into one entry and never drop the secondary one.
- When the input lists many individual occurrences of the same session (an "all dates" / "alla tillfällen" style list), return ONE recurring event with an RRULE covering them, not one entry per occurrence. Set start/end from the first occurrence and add UNTIL for the last.
- A travel itinerary (flights, trains, buses, ferries) is one event per leg. Return each listed leg exactly once.
- Input may be in any language. Keep the event name in its original language.

Per-event rules:
- summary: short event title (required, never empty)
- description: any extra context, or empty string
- location: physical address, venue, or video link, or empty string
- startLocal, endLocal: the wall-clock time exactly as written, in the local time of the place where it happens, formatted "YYYY-MM-DDTHH:mm" with no offset and no "Z". Never convert between time zones. For all-day events use "YYYY-MM-DD"
- startTimeZone, endTimeZone: IANA tz database name of the place where the start and the end happen. For travel, startTimeZone is the departure place and endTimeZone the arrival place (e.g. "Copenhagen - Keflavík" is "Europe/Copenhagen" and "Atlantic/Reykjavik"). Otherwise both are the event's place. Use "${timeZone}" when the input names no place
- allDay: true if no specific time was given
- A time range ("12:55 - 15:25", "from 9 to 11") gives both start and end; for travel the second time is the arrival. Only when the input gives no end time at all, set end to start + 1 hour
- Resolve relative dates ("Friday", "next week") against the current time: ${now.toISOString()}
- recurrence: array of RFC 5545 RRULE strings (e.g. ["RRULE:FREQ=WEEKLY;BYDAY=TU"] for "every Tuesday"). Include UNTIL when the input gives an end date (e.g. ["RRULE:FREQ=WEEKLY;BYDAY=SA;UNTIL=20261031T235959Z"]). Empty array if the event does not repeat
- When the input gives a date without a year, infer the year from the current time so the date is the next upcoming one
- Do not invent events; only return what is actually present in the input.`;
};

const isTimeZone = (timeZone: string): boolean => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
};

const offsetMinutesAt = (instantMs: number, timeZone: string): number => {
  const name =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' })
      .formatToParts(new Date(instantMs))
      .find(part => part.type === 'timeZoneName')?.value ?? 'GMT';
  const match = name.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === '-' ? -minutes : minutes;
};

const formatOffset = (minutes: number): string => {
  const abs = Math.abs(minutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, '0');
  return `${minutes < 0 ? '-' : '+'}${hours}:${String(abs % 60).padStart(2, '0')}`;
};

// The LLM reliably names a place's zone but often applies the wrong DST offset
// (e.g. Toronto's summer -04:00 in November), so offsets come from the tz
// database instead. The offset is resolved twice because the first guess uses
// the wall time as if it were UTC, which can sit on the other side of a DST
// transition from the real instant.
export const toZonedIso = (local: string, timeZone: string): string => {
  if (DATE_ONLY.test(local)) return local;
  const match = local.match(LOCAL_DATE_TIME);
  if (!match) return local;
  const wallTime = `${match[1]}${match[2] ?? ':00'}`;
  const wallAsUtc = Date.parse(`${wallTime}Z`);
  const guess = offsetMinutesAt(wallAsUtc, timeZone);
  const offset = offsetMinutesAt(wallAsUtc - guess * MS_PER_MINUTE, timeZone);
  return `${wallTime}${formatOffset(offset)}`;
};

export const toCalendarEvents = (
  parsed: ParsedEvent[],
  fallbackTimeZone: string,
): CalendarEvent[] =>
  parsed
    .filter(e => e.summary && e.startLocal)
    .map(e => {
      const startTimeZone = isTimeZone(e.startTimeZone)
        ? e.startTimeZone
        : fallbackTimeZone;
      const endTimeZone = isTimeZone(e.endTimeZone)
        ? e.endTimeZone
        : startTimeZone;
      return {
        summary: e.summary,
        description: e.description,
        location: e.location,
        start: toZonedIso(e.startLocal, startTimeZone),
        end: toZonedIso(e.endLocal || e.startLocal, endTimeZone),
        timeZone: startTimeZone,
        allDay: e.allDay,
        recurrence: e.recurrence,
      };
    })
    // gpt-4o-mini sometimes repeats a leg of a multi-event list despite the prompt.
    .filter(
      (e, i, all) =>
        all.findIndex(o => o.start === e.start && o.end === e.end) === i,
    )
    // It also sometimes adds a whole-trip event spanning an itinerary's legs
    // (first leg's departure to second leg's arrival), which no input line lists.
    .filter(
      (e, _, all) =>
        !all.some(
          first =>
            first !== e &&
            first.start === e.start &&
            first.end !== e.end &&
            all.some(
              last =>
                last !== e &&
                last !== first &&
                last.end === e.end &&
                last.start !== e.start &&
                Date.parse(first.end) <= Date.parse(last.start),
            ),
        ),
    );
