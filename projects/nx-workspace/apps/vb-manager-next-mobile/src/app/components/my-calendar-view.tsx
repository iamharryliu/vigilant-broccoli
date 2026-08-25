'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import { CalendarPlus } from 'lucide-react';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';
import { VisuallyHidden } from '@vigilant-broccoli/react-lib';
import { CalendarInput } from './calendar-input';
import {
  buildAuthHeaders,
  signOutDueToExpiredToken,
} from '../providers/auth-provider';

const BIRTHDAYS_CALENDAR =
  'f61b08e940f7c4fb8becf0d419c8c09f7e0c46d6d03343637aef5837c766a09b@group.calendar.google.com';
const CALENDAR_TITLE = 'Personal Calendar';

const CALENDAR_SOURCES: {
  id: string;
  color: string;
  label: string;
  kind: 'owner' | 'shared';
}[] = [
  {
    id: GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.GREEN,
    label: 'Personal',
    kind: 'owner',
  },
  {
    id: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.RED,
    label: 'Work',
    kind: 'owner',
  },
  {
    id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.PURPLE,
    label: 'Sweden holidays',
    kind: 'shared',
  },
  {
    id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.PHASES_OF_THE_MOON,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_PINK,
    label: 'Moon phases',
    kind: 'shared',
  },
  {
    id: BIRTHDAYS_CALENDAR,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.BLUE,
    label: 'Birthdays',
    kind: 'shared',
  },
  {
    id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.H_AND_K,
    color: GOOGLE_CALENDAR.CALENDAR_COLOR.PINK,
    label: 'H&K',
    kind: 'shared',
  },
];

const CALENDAR_CONFIG: CalendarConfig = {
  height: 600,
  wkst: 2,
  ctz: GOOGLE_CALENDAR.TIMEZONE.COPENHAGEN,
  showPrint: 0,
  mode: 'AGENDA',
  title: CALENDAR_TITLE,
  ownerCalendars: CALENDAR_SOURCES.filter(source => source.kind === 'owner').map(
    source => ({ email: source.id, color: source.color }),
  ),
  sharedCalendars: CALENDAR_SOURCES.filter(source => source.kind === 'shared').map(
    source => ({ id: source.id, color: source.color }),
  ),
};

const CALENDAR_COLOR_BY_ID = new Map(
  CALENDAR_SOURCES.map(source => [source.id, decodeURIComponent(source.color)]),
);

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

const eventsApiUrl = () => {
  const params = new URLSearchParams();
  CALENDAR_SOURCES.forEach(source => params.append('calendarId', source.id));
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

const formatEventTime = (event: CalendarEvent) => {
  const start = new Date(event.start);
  if (event.allDay) {
    return start.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  return start.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
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
  const isMobile = useIsMobileBrowser();

  const agendaEvents = useMemo(
    () =>
      events &&
      events
        .flatMap(expandMultiDayEvent)
        .sort((a, b) => a.start.localeCompare(b.start)),
    [events],
  );

  useEffect(() => {
    if (!isMobile) return;

    let cancelled = false;
    setError(null);

    const load = async () => {
      const headers = await buildAuthHeaders({ includeGoogleToken: true });
      const res = await fetch(eventsApiUrl(), { headers });
      if (res.status === 401) {
        await signOutDueToExpiredToken();
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
  }, [isMobile, refreshKey]);

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open);
    if (!open) setRefreshKey(key => key + 1);
  };

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <button
        type="button"
        onClick={() => setCreateOpen(true)}
        className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
      >
        <CalendarPlus size={16} />
        Create Event
      </button>

      {isMobile === false && (
        <div className="w-full min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200">
          <iframe
            src={buildCalendarUrl(CALENDAR_CONFIG)}
            className="h-full w-full dark:invert dark:hue-rotate-180"
            title={CALENDAR_TITLE}
          />
        </div>
      )}

      {isMobile === true && (
        <div className="w-full min-h-0 flex-1 overflow-y-auto rounded-lg border border-gray-200">
          {error && <p className="p-4 text-sm text-red-600">{error}</p>}
          {!error && agendaEvents === null && (
            <p className="p-4 text-sm text-gray-500">{LOADING_MESSAGE}</p>
          )}
          {!error && agendaEvents !== null && agendaEvents.length === 0 && (
            <p className="p-4 text-sm text-gray-500">{EMPTY_MESSAGE}</p>
          )}
          {!error && agendaEvents !== null && agendaEvents.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {agendaEvents.map(event => (
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
                          CALENDAR_COLOR_BY_ID.get(event.calendarId) ?? '#9ca3af',
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
          )}
        </div>
      )}

      <Dialog.Root open={createOpen} onOpenChange={handleCreateOpenChange}>
        <Dialog.Content
          style={{
            maxWidth: '95vw',
            width: '95vw',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <VisuallyHidden>
            <Dialog.Title>Create Calendar Event</Dialog.Title>
          </VisuallyHidden>
          <CalendarInput />
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};
