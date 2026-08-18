'use client';

import { useEffect, useState } from 'react';
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
          <CopyButton text={calendar.url} />
        </li>
      ))}
    </ul>
  );
};
