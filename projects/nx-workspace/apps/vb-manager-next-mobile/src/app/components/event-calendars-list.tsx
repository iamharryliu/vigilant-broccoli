'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, CalendarRange, List } from 'lucide-react';
import { CopyButton } from '@vigilant-broccoli/react-lib';
import { buildAuthHeaders } from '../providers/auth-provider';

const EVENT_CALENDARS_API = '/api/event-calendars';
const LOADING_MESSAGE = 'Loading…';
const EMPTY_MESSAGE = 'No event calendars yet.';
const FETCH_ERROR = 'Failed to load event calendars.';

type EventCalendarLink = {
  id: string;
  name: string;
  url: string;
};

type CalendarViewMode = 'AGENDA' | 'WEEK' | 'MONTH';

const CALENDAR_VIEWS: { mode: CalendarViewMode; label: string; Icon: typeof List }[] = [
  { mode: 'AGENDA', label: 'Schedule', Icon: List },
  { mode: 'WEEK', label: 'Week', Icon: CalendarRange },
  { mode: 'MONTH', label: 'Month', Icon: CalendarDays },
];

const withViewMode = (url: string, mode: CalendarViewMode) => `${url}&mode=${mode}`;

export const EventCalendarsList = () => {
  const [calendars, setCalendars] = useState<EventCalendarLink[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const headers = await buildAuthHeaders();
      const res = await fetch(EVENT_CALENDARS_API, { headers });
      if (!res.ok) throw res;
      return res.json();
    };

    load()
      .then(data => {
        if (!cancelled) setCalendars(data.calendars ?? []);
      })
      .catch(() => {
        if (!cancelled) setError(FETCH_ERROR);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (calendars === null) {
    return <p className="text-sm text-gray-500">{LOADING_MESSAGE}</p>;
  }
  if (calendars.length === 0) {
    return <p className="text-sm text-gray-500">{EMPTY_MESSAGE}</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {calendars.map(calendar => (
        <li
          key={calendar.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
        >
          <a
            href={calendar.url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {calendar.name}
          </a>
          <div className="flex items-center gap-1">
            {CALENDAR_VIEWS.map(({ mode, label, Icon }) => (
              <a
                key={mode}
                href={withViewMode(calendar.url, mode)}
                target="_blank"
                rel="noreferrer"
                title={label}
                aria-label={`Open ${calendar.name} in ${label} view`}
                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <Icon size={16} />
              </a>
            ))}
            <CopyButton text={calendar.url} />
          </div>
        </li>
      ))}
    </ul>
  );
};
