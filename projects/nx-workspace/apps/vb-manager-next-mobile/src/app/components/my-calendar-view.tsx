'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';
import { CalendarInput } from './calendar-input';
import { EventCalendarLink, EventCalendarsList } from './event-calendars-list';
import { CALENDAR_TAB, CalendarTab } from '../app.const';
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

const TAB_TOUCH_CLASS = 'px-4 text-sm';

const MOBILE_USER_AGENT_REGEX =
  /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i;

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

const useIsMobileBrowser = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(MOBILE_USER_AGENT_REGEX.test(navigator.userAgent));
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
  const [tab, setTab] = useState<CalendarTab>(CALENDAR_TAB.CALENDAR);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const isMobile = useIsMobileBrowser();

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

  return (
    <Tabs
      value={tab}
      onValueChange={value => setTab(value as CalendarTab)}
      className="flex h-full w-full flex-col gap-3"
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <TabsList className="h-11">
          {Object.values(CALENDAR_TAB).map(name => (
            <TabsTrigger key={name} value={name} className={TAB_TOUCH_CLASS}>
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          aria-label="Create calendar event"
          title="Create calendar event"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
        >
          <CalendarPlus size={18} />
        </button>
      </div>

      <TabsContent value={CALENDAR_TAB.EVENT_CALENDARS} className="mt-0">
        <EventCalendarsList
          calendars={eventCalendarsLoaded ? eventCalendars : null}
          error={eventCalendarsError}
          hiddenIds={hiddenIds}
          onToggleHidden={toggleHidden}
        />
      </TabsContent>

      {/* Force-mounted so switching tabs doesn't reload the iframe. */}
      <TabsContent
        forceMount
        value={CALENDAR_TAB.CALENDAR}
        className="mt-0 flex min-h-0 flex-1 flex-col"
        style={{
          display: tab === CALENDAR_TAB.CALENDAR ? undefined : 'none',
        }}
        aria-hidden={tab !== CALENDAR_TAB.CALENDAR}
      >
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
                    {group.events.map(event => (
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
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        )}
      </TabsContent>

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
    </Tabs>
  );
};
