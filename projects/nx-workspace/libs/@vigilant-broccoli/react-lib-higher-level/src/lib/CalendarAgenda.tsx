'use client';

import { useEffect, useMemo, useState } from 'react';

export interface CalendarEvent {
  id: string;
  calendarId: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink?: string;
}

interface EventDayGroup {
  key: string;
  date: Date;
  events: CalendarEvent[];
}

const LOADING_MESSAGE = 'Loading…';
const EMPTY_MESSAGE = 'No upcoming events.';
const ALL_DAY_LABEL = 'All day';
const TODAY_LABEL = 'Today';
const FALLBACK_COLOR = '#9ca3af';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NOW_REFRESH_MS = 60 * 1000;

const dateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date, b: Date) =>
  dateOnly(a).getTime() === dateOnly(b).getTime();

const daySpan = (event: CalendarEvent) => {
  const startDay = dateOnly(new Date(event.start));
  const endDay = dateOnly(new Date(event.end));
  const days = Math.round((endDay.getTime() - startDay.getTime()) / MS_PER_DAY);
  return event.allDay ? days : days + 1;
};

const expandMultiDayEvent = (event: CalendarEvent): CalendarEvent[] => {
  const span = daySpan(event);
  if (span <= 1) return [event];

  const startDay = dateOnly(new Date(event.start));
  return Array.from({ length: span }, (_, index) => {
    const occurrenceDate = new Date(startDay);
    occurrenceDate.setDate(occurrenceDate.getDate() + index);
    return {
      ...event,
      id: `${event.id}-day${index + 1}`,
      summary: `${event.summary} (Day ${index + 1}/${span})`,
      start: occurrenceDate.toISOString(),
      allDay: true,
    };
  });
};

const formatEventTime = (event: CalendarEvent) => {
  if (event.allDay) return ALL_DAY_LABEL;
  return new Date(event.start).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDateHeading = (date: Date) => {
  if (isSameDay(date, new Date())) return TODAY_LABEL;
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

const groupEventsByDay = (events: CalendarEvent[]): EventDayGroup[] => {
  const groups = new Map<string, CalendarEvent[]>();
  events.forEach(event => {
    const key = dateOnly(new Date(event.start)).toISOString();
    const group = groups.get(key);
    if (group) group.push(event);
    else groups.set(key, [event]);
  });
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, dayEvents]) => ({
      key,
      date: new Date(key),
      events: dayEvents,
    }));
};

const useNow = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), NOW_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return now;
};

// Index to insert the "now" line at: before the first timed event that has not
// started, but never above an all-day event.
const findNowLineIndex = (events: CalendarEvent[], now: Date) => {
  const nowMs = now.getTime();
  const upcomingIndex = events.findIndex(
    event => !event.allDay && new Date(event.start).getTime() > nowMs,
  );
  const lastAllDayIndex = events.reduce(
    (last, event, index) => (event.allDay ? index : last),
    -1,
  );
  return Math.max(
    upcomingIndex === -1 ? events.length : upcomingIndex,
    lastAllDayIndex + 1,
  );
};

const NowLine = () => (
  <li aria-label="Now" className="flex items-center py-0 pl-3 pr-4">
    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
    <span className="h-px flex-1 bg-red-500" />
  </li>
);

interface CalendarAgendaProps {
  // null while loading.
  events: CalendarEvent[] | null;
  error?: string | null;
  hiddenIds: Set<string>;
  colorByCalendarId: Map<string, string>;
}

export const CalendarAgenda = ({
  events,
  error,
  hiddenIds,
  colorByCalendarId,
}: CalendarAgendaProps) => {
  const now = useNow();

  const agendaGroups = useMemo(
    () =>
      events &&
      groupEventsByDay(
        events
          .filter(event => !hiddenIds.has(event.calendarId))
          .flatMap(expandMultiDayEvent)
          .sort((a, b) => a.start.localeCompare(b.start)),
      ),
    [events, hiddenIds],
  );

  return (
    <div className="w-full rounded-lg border border-gray-200">
      {error && <p className="p-4 text-sm text-red-600">{error}</p>}
      {!error && agendaGroups === null && (
        <p className="p-4 text-sm text-gray-500">{LOADING_MESSAGE}</p>
      )}
      {!error && agendaGroups !== null && agendaGroups.length === 0 && (
        <p className="p-4 text-sm text-gray-500">{EMPTY_MESSAGE}</p>
      )}
      {!error &&
        agendaGroups !== null &&
        agendaGroups.map(group => (
          <div key={group.key}>
            <p className="sticky top-[var(--topbar-h)] z-10 bg-gray-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 md:top-0">
              {formatDateHeading(group.date)}
            </p>
            <ul className="divide-y divide-gray-100">
              {group.events.flatMap((event, index) => [
                isSameDay(group.date, now) &&
                  index === findNowLineIndex(group.events, now) && (
                    <NowLine key="now-line" />
                  ),
                <li key={`${event.calendarId}-${event.id}`}>
                  <a
                    href={event.htmlLink ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          colorByCalendarId.get(event.calendarId) ??
                          FALLBACK_COLOR,
                      }}
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-gray-900">
                        {event.summary}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatEventTime(event)}
                      </span>
                    </span>
                  </a>
                </li>,
              ])}
              {isSameDay(group.date, now) &&
                findNowLineIndex(group.events, now) === group.events.length && (
                  <NowLine />
                )}
            </ul>
          </div>
        ))}
    </div>
  );
};
