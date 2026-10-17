'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  CalendarPlus,
  CloudSun,
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
  CalendarAgenda,
  CalendarEvent,
  EventCalendarLink,
  EventCalendarsList,
  TabbedView,
  TabbedViewTab,
} from '@vigilant-broccoli/react-lib-higher-level';
import {
  VisuallyHidden,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@vigilant-broccoli/react-lib';
import { QuickLinksPanel } from '@vigilant-broccoli/react-lib-higher-level';
import { CalendarInput } from './calendar-input';
import { GoogleTasksView } from './google-tasks-view';
import { NotepadEditor } from './notepad-editor';
import {
  CALENDAR_TAB,
  CALENDAR_TAB_QUERY_PARAM,
  CalendarTab,
} from '../app.const';
import { QUICK_LINKS } from '../constants/quick-links';
import { buildAuthHeaders, reconnectGoogle } from '../providers/auth-provider';

// Split into its own chunk, and only mounted while its tab is active, so the
// weather card's code, geolocation prompt and requests stay off the initial
// page load.
const WeatherView = dynamic(
  () => import('./weather-view').then(module => module.WeatherView),
  { ssr: false },
);

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
const FETCH_ERROR = 'Failed to load calendar events.';

const eventsApiUrl = (extraCalendarIds: string[]) => {
  const params = new URLSearchParams();
  PERSONAL_CALENDAR_SOURCES.forEach(source =>
    params.append('calendarId', source.id),
  );
  extraCalendarIds.forEach(id => params.append('calendarId', id));
  return `${EVENTS_API}?${params.toString()}`;
};

const useIsMobileBrowser = () => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobile(isMobileUserAgent(navigator.userAgent));
  }, []);

  return isMobile;
};

export const HomeView = () => {
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
            <CalendarAgenda
              events={events}
              error={error}
              hiddenIds={hiddenIds}
              colorByCalendarId={calendarColorById}
            />
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
    {
      value: CALENDAR_TAB.WEATHER,
      label: CALENDAR_TAB.WEATHER,
      icon: <CloudSun size={TAB_ICON_SIZE} />,
      content: <WeatherView />,
    },
  ];

  return (
    <>
      <TabbedView
        tabs={tabs}
        value={tab}
        onValueChange={handleTabChange}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label="Create calendar event"
            title="Create calendar event"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
          >
            <CalendarPlus size={18} />
          </button>
        }
      />

      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent
          className="top-[max(env(safe-area-inset-top),0.5rem)] block w-[calc(100%-1rem)] max-w-[600px] max-h-[calc(100svh-env(safe-area-inset-top)-1rem)] translate-y-0 gap-0 overflow-y-auto overscroll-contain"
          aria-describedby={undefined}
          showCloseButton={false}
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
