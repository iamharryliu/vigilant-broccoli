'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  CalendarPlus,
  Link2,
  ListTodo,
  Rows3,
  StickyNote,
} from 'lucide-react';
import { isMobileUserAgent } from '@vigilant-broccoli/common-browser';
import {
  BASE_CALENDAR_CONFIG,
  buildEventCalendarEmbedUrl,
  getEventCalendarColor,
  PERSONAL_CALENDAR_SOURCES,
  readHiddenCalendarIds,
  writeHiddenCalendarIds,
} from '@vigilant-broccoli/personal-common-js';
import {
  VisuallyHidden,
  Dialog,
  DialogContent,
  DialogTitle,
  QuickLinksPanel,
} from '@vigilant-broccoli/react-lib';
import { CalendarInput } from './calendar-input';
import { EventCalendarLink, EventCalendarsList } from './event-calendars-list';
import { GoogleTasksView } from './google-tasks-view';
import { NotepadEditor } from './notepad-editor';
import { TabbedView, TabbedViewTab } from './tabbed-view';
import {
  CALENDAR_TAB,
  CALENDAR_TAB_QUERY_PARAM,
  CalendarTab,
} from '../app.const';
import { QUICK_LINKS } from '../constants/quick-links';
import { buildAuthHeaders, reconnectGoogle } from '../providers/auth-provider';

const CALENDAR_TITLE = BASE_CALENDAR_CONFIG.title;

const BASE_CALENDAR_COLOR_BY_ID = new Map(
  PERSONAL_CALENDAR_SOURCES.map(source => [
    source.id,
    decodeURIComponent(source.color),
  ]),
);

const EVENT_CALENDARS_API = '/api/event-calendars';

const HIDDEN_CALENDARS_STORAGE_KEY = 'vb-manager-hidden-event-calendars';

const TAB_ICON_SIZE = 18;

// Tab content isn't a flex child, so size the editor to the viewport minus
// the top bar and tab row.
const NOTEPAD_HEIGHT = 'calc(100dvh - var(--topbar-h) - 8rem)';

const CALENDAR_TABS = Object.values(CALENDAR_TAB);

const EVENTS_API = '/api/calendar/events';
const LOADING_MESSAGE = 'Loading…';
const EMPTY_MESSAGE = 'No upcoming events.';
const FETCH_ERROR = 'Failed to load calendar events.';

interface CalendarEvent {
  id: string;
  calendarId: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
  htmlLink?: string;
}

const eventsApiUrl = (extraCalendarIds: string[]) => {
  const params = new URLSearchParams();
  PERSONAL_CALENDAR_SOURCES.forEach(source =>
    params.append('calendarId', source.id),
  );
  extraCalendarIds.forEach(id => params.append('calendarId', id));
  return `${EVENTS_API}?${params.toString()}`;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

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

const ALL_DAY_LABEL = 'All day';
const TODAY_LABEL = 'Today';

const formatEventTime = (event: CalendarEvent) => {
  if (event.allDay) return ALL_DAY_LABEL;
  return new Date(event.start).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const isSameDay = (a: Date, b: Date) =>
  dateOnly(a).getTime() === dateOnly(b).getTime();

const formatDateHeading = (date: Date) => {
  if (isSameDay(date, new Date())) return TODAY_LABEL;
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

interface EventDayGroup {
  key: string;
  date: Date;
  events: CalendarEvent[];
}

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

const NOW_REFRESH_MS = 60 * 1000;

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

const useIsMobileBrowser = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(isMobileUserAgent(navigator.userAgent));
  }, []);

  return isMobile;
};

export const MyCalendarView = () => {
  const [createOpen, setCreateOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [eventCalendars, setEventCalendars] = useState<EventCalendarLink[]>([]);
  // Gates the agenda fetch below so it waits for this list once, instead of
  // firing twice — once without event calendars, once with them as soon as
  // they arrive.
  const [eventCalendarsLoaded, setEventCalendarsLoaded] = useState(false);
  const [eventCalendarsError, setEventCalendarsError] = useState(false);
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<CalendarTab>(() => {
    const requested = searchParams.get(CALENDAR_TAB_QUERY_PARAM);
    return (
      CALENDAR_TABS.find(name => name === requested) ?? CALENDAR_TAB.CALENDAR
    );
  });
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const isMobile = useIsMobileBrowser();
  const now = useNow();

  useEffect(() => {
    setHiddenIds(new Set(readHiddenCalendarIds(HIDDEN_CALENDARS_STORAGE_KEY)));
  }, []);

  const toggleHidden = (googleCalendarId: string) =>
    setHiddenIds(current => {
      const next = new Set(current);
      if (!next.delete(googleCalendarId)) next.add(googleCalendarId);
      writeHiddenCalendarIds(HIDDEN_CALENDARS_STORAGE_KEY, next);
      return next;
    });

  useEffect(() => {
    const load = async () => {
      const headers = await buildAuthHeaders();
      const res = await fetch(EVENT_CALENDARS_API, { headers });
      if (!res.ok) throw res;
      return res.json();
    };

    load()
      .then(data => setEventCalendars(data.calendars ?? []))
      .catch(() => setEventCalendarsError(true))
      .finally(() => setEventCalendarsLoaded(true));
  }, []);

  // Keyed by calendar id (not list position) so a calendar's color stays
  // the same as the list is refetched, instead of reassigning colors.
  const eventCalendarColorById = useMemo(() => {
    const colors = new Map<string, string>();
    eventCalendars.forEach((calendar, index) => {
      colors.set(calendar.googleCalendarId, getEventCalendarColor(index));
    });
    return colors;
  }, [eventCalendars]);

  const calendarSrc = useMemo(
    () =>
      buildEventCalendarEmbedUrl({
        mode: 'AGENDA',
        eventCalendars: eventCalendars.map(calendar => ({
          hiddenKey: calendar.googleCalendarId,
          googleCalendarId: calendar.googleCalendarId,
        })),
        hiddenKeys: hiddenIds,
      }),
    [eventCalendars, hiddenIds],
  );

  const calendarColorById = useMemo(() => {
    const colors = new Map(BASE_CALENDAR_COLOR_BY_ID);
    eventCalendarColorById.forEach((color, id) =>
      colors.set(id, decodeURIComponent(color)),
    );
    return colors;
  }, [eventCalendarColorById]);

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

  useEffect(() => {
    if (!isMobile || !eventCalendarsLoaded) return;

    let cancelled = false;
    setError(null);

    const load = async () => {
      const headers = await buildAuthHeaders({ includeGoogleToken: true });
      const res = await fetch(
        eventsApiUrl(eventCalendars.map(calendar => calendar.googleCalendarId)),
        { headers },
      );
      if (res.status === 401) {
        await reconnectGoogle();
        return null;
      }
      if (!res.ok) throw res;
      return res.json();
    };

    load()
      .then(data => {
        if (cancelled || !data) return;
        setEvents(data.events ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(FETCH_ERROR);
      });

    return () => {
      cancelled = true;
    };
  }, [isMobile, refreshKey, eventCalendarsLoaded, eventCalendars]);

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open);
    if (!open) setRefreshKey(key => key + 1);
  };

  const handleTabChange = (next: CalendarTab) => {
    setTab(next);
    const params = new URLSearchParams(window.location.search);
    if (next === CALENDAR_TAB.CALENDAR) params.delete(CALENDAR_TAB_QUERY_PARAM);
    else params.set(CALENDAR_TAB_QUERY_PARAM, next);
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      query ? `?${query}` : window.location.pathname,
    );
  };

  const tabs: TabbedViewTab<CalendarTab>[] = [
    {
      value: CALENDAR_TAB.CALENDAR,
      label: CALENDAR_TAB.CALENDAR,
      icon: <CalendarDays size={TAB_ICON_SIZE} />,
      // Force-mounted so switching tabs doesn't reload the iframe.
      forceMount: true,
      content: (
        <>
          {isMobile === false && (
            <div className="w-full min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200">
              <iframe
                src={calendarSrc}
                className="h-full w-full dark:invert dark:hue-rotate-180"
                title={CALENDAR_TITLE}
              />
            </div>
          )}

          {isMobile === true && (
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
                                  calendarColorById.get(event.calendarId) ??
                                  '#9ca3af',
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
                        findNowLineIndex(group.events, now) ===
                          group.events.length && <NowLine />}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </>
      ),
    },
    {
      value: CALENDAR_TAB.EVENT_CALENDARS,
      label: CALENDAR_TAB.EVENT_CALENDARS,
      icon: <Rows3 size={TAB_ICON_SIZE} />,
      content: (
        <EventCalendarsList
          calendars={eventCalendarsLoaded ? eventCalendars : null}
          error={eventCalendarsError}
          hiddenIds={hiddenIds}
          onToggleHidden={toggleHidden}
        />
      ),
    },
    {
      value: CALENDAR_TAB.TASKS,
      label: CALENDAR_TAB.TASKS,
      icon: <ListTodo size={TAB_ICON_SIZE} />,
      content: <GoogleTasksView />,
    },
    {
      value: CALENDAR_TAB.NOTEPAD,
      label: CALENDAR_TAB.NOTEPAD,
      icon: <StickyNote size={TAB_ICON_SIZE} />,
      content: <NotepadEditor style={{ height: NOTEPAD_HEIGHT }} />,
    },
    {
      value: CALENDAR_TAB.QUICK_LINKS,
      label: CALENDAR_TAB.QUICK_LINKS,
      icon: <Link2 size={TAB_ICON_SIZE} />,
      content: <QuickLinksPanel links={QUICK_LINKS} />,
    },
  ];

  return (
    <>
      <TabbedView
        tabs={tabs}
        value={tab}
        onValueChange={handleTabChange}
        actions={
          tab !== CALENDAR_TAB.TASKS && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              aria-label="Create calendar event"
              title="Create calendar event"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
            >
              <CalendarPlus size={18} />
            </button>
          )
        }
      />

      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent
          className="block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto"
          aria-describedby={undefined}
          showCloseButton={false}
          style={{
            maxWidth: '95vw',
            width: '95vw',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <VisuallyHidden>
            <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
              Create Calendar Event
            </DialogTitle>
          </VisuallyHidden>
          <CalendarInput />
        </DialogContent>
      </Dialog>
    </>
  );
};
