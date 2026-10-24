'use client';

import {
  type Ref,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface CalendarEventPerson {
  displayName?: string;
  email?: string;
}

export interface CalendarEventAttendee extends CalendarEventPerson {
  responseStatus?: string;
  self?: boolean;
  organizer?: boolean;
}

// Mirrors GoogleCalendarEvent from google-workspace, a Node lib this browser
// lib must not depend on.
export interface CalendarEvent {
  id: string;
  calendarId: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink?: string;
  location?: string;
  description?: string;
  hangoutLink?: string;
  attendees?: CalendarEventAttendee[];
  organizer?: CalendarEventPerson;
  recurringEventId?: string;
}

// A per-day row; source is the event it was split from, which clicks report.
interface AgendaEntry extends CalendarEvent {
  source: CalendarEvent;
}

interface EventDayGroup {
  key: string;
  date: Date;
  events: AgendaEntry[];
}

const LOADING_MESSAGE = 'Loading…';
const EMPTY_MESSAGE = 'No upcoming events.';
const ALL_DAY_LABEL = 'All day';
const TODAY_LABEL = 'Today';
export const CALENDAR_EVENT_FALLBACK_COLOR = '#9ca3af';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NOW_REFRESH_MS = 60 * 1000;
// Leaves some earlier events in view above the "now" line.
const NOW_LINE_VIEWPORT_FRACTION = 0.18;

// The agenda owns its scrolling so the page stays fixed to the viewport. The
// scrollbar is hidden because Chromium paints sticky headings over a nested
// scroller's overlay scrollbar, leaving a gap in its thumb at each heading.
const AGENDA_SCROLLER_CLASS =
  'min-h-0 w-full flex-1 overflow-y-auto overscroll-contain rounded-lg border border-gray-200 dark:border-gray-700 pb-[env(safe-area-inset-bottom)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

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

const expandMultiDayEvent = (event: CalendarEvent): AgendaEntry[] => {
  const span = daySpan(event);
  if (span <= 1) return [{ ...event, source: event }];

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
      source: event,
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

const groupEventsByDay = (events: AgendaEntry[]): EventDayGroup[] => {
  const groups = new Map<string, AgendaEntry[]>();
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

const AGENDA_ROW_CLASS =
  'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800';

const AgendaRowContent = ({
  event,
  colorByCalendarId,
}: {
  event: AgendaEntry;
  colorByCalendarId: Map<string, string>;
}) => (
  <>
    <span
      className="h-2.5 w-2.5 shrink-0 rounded-full"
      style={{
        backgroundColor:
          colorByCalendarId.get(event.calendarId) ??
          CALENDAR_EVENT_FALLBACK_COLOR,
      }}
    />
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
        {event.summary}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {formatEventTime(event)}
      </span>
    </span>
  </>
);

const NowLine = ({ ref }: { ref: Ref<HTMLLIElement> }) => (
  <li ref={ref} aria-label="Now" className="flex items-center py-0 pl-3 pr-4">
    <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
    <span className="h-px flex-1 bg-red-500" />
  </li>
);

// Sets scrollTop directly: scrollIntoView can also scroll the outer page on
// mobile Safari. The visible area starts below the today heading, which sticks
// to the top of the container.
const scrollNowLineIntoView = (
  container: HTMLElement,
  nowLine: HTMLElement,
  todayHeading: HTMLElement,
) => {
  const obscuredHeight = todayHeading.offsetHeight;
  const visibleHeight = container.clientHeight - obscuredHeight;
  const containerTop =
    container.getBoundingClientRect().top + container.clientTop;
  const lineOffset = nowLine.getBoundingClientRect().top - containerTop;
  const target =
    container.scrollTop +
    lineOffset -
    obscuredHeight -
    visibleHeight * NOW_LINE_VIEWPORT_FRACTION;
  const maxScrollTop = container.scrollHeight - container.clientHeight;
  container.scrollTop = Math.min(Math.max(target, 0), maxScrollTop);
};

interface CalendarAgendaProps {
  // null while loading.
  events: CalendarEvent[] | null;
  error?: string | null;
  hiddenIds: Set<string>;
  colorByCalendarId: Map<string, string>;
  // When set, rows are buttons reporting the original (unsplit) event instead
  // of links to Google Calendar.
  onEventClick?: (event: CalendarEvent) => void;
}

export const CalendarAgenda = ({
  events,
  error,
  hiddenIds,
  colorByCalendarId,
  onEventClick,
}: CalendarAgendaProps) => {
  const now = useNow();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const nowLineRef = useRef<HTMLLIElement>(null);
  const todayHeadingRef = useRef<HTMLParagraphElement>(null);
  const hasAutoScrolledRef = useRef(false);

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

  // Scrolls once, when events first render with layout. Later renders (the
  // minute tick, refetches, visibility toggles) must not move the list under
  // the user. When the force-mounted Calendar tab is hidden (a restored
  // non-Calendar tab) there is no layout yet, so wait until it is shown.
  useLayoutEffect(() => {
    if (hasAutoScrolledRef.current || agendaGroups === null) return;
    const scroller = scrollerRef.current;
    const nowLine = nowLineRef.current;
    const todayHeading = todayHeadingRef.current;
    if (!scroller || !nowLine || !todayHeading) {
      hasAutoScrolledRef.current = true;
      return;
    }

    const scrollIfLaidOut = () => {
      if (nowLine.getClientRects().length === 0) return false;
      hasAutoScrolledRef.current = true;
      scrollNowLineIntoView(scroller, nowLine, todayHeading);
      return true;
    };

    if (scrollIfLaidOut()) return;
    const observer = new ResizeObserver(() => {
      if (scrollIfLaidOut()) observer.disconnect();
    });
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [agendaGroups]);

  return (
    <div ref={scrollerRef} className={AGENDA_SCROLLER_CLASS}>
      {error && (
        <p className="p-4 text-sm text-red-600 dark:text-red-300">{error}</p>
      )}
      {!error && agendaGroups === null && (
        <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
          {LOADING_MESSAGE}
        </p>
      )}
      {!error && agendaGroups !== null && agendaGroups.length === 0 && (
        <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
          {EMPTY_MESSAGE}
        </p>
      )}
      {!error &&
        agendaGroups !== null &&
        agendaGroups.map(group => (
          <div key={group.key}>
            <p
              ref={isSameDay(group.date, now) ? todayHeadingRef : undefined}
              className="sticky top-0 z-10 bg-gray-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-950 dark:text-gray-400"
            >
              {formatDateHeading(group.date)}
            </p>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {group.events.flatMap((event, index) => [
                isSameDay(group.date, now) &&
                  index === findNowLineIndex(group.events, now) && (
                    <NowLine key="now-line" ref={nowLineRef} />
                  ),
                <li key={`${event.calendarId}-${event.id}`}>
                  {onEventClick ? (
                    <button
                      type="button"
                      onClick={() => onEventClick(event.source)}
                      className={AGENDA_ROW_CLASS}
                    >
                      <AgendaRowContent
                        event={event}
                        colorByCalendarId={colorByCalendarId}
                      />
                    </button>
                  ) : (
                    <a
                      href={event.htmlLink ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className={AGENDA_ROW_CLASS}
                    >
                      <AgendaRowContent
                        event={event}
                        colorByCalendarId={colorByCalendarId}
                      />
                    </a>
                  )}
                </li>,
              ])}
              {isSameDay(group.date, now) &&
                findNowLineIndex(group.events, now) === group.events.length && (
                  <NowLine ref={nowLineRef} />
                )}
            </ul>
          </div>
        ))}
    </div>
  );
};
