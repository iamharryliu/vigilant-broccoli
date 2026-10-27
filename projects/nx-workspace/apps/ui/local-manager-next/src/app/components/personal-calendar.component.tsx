'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarConfig } from '@vigilant-broccoli/common-browser';
import { buildEventCalendarEmbedUrl } from '@harry/personal';
import { BASE_CALENDAR_CONFIG } from '@harry/private';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { EventCalendar } from '../constants/event-calendars';
import { useCalendarViewEventCalendars } from '../hooks/useCalendarViewEventCalendars';

// Matches the `md` breakpoint used elsewhere in the app (e.g. Sidebar's
// narrow-viewport check) so "mobile" means the same thing everywhere.
const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';

type CalendarMode = CalendarConfig['mode'];

type PersonalCalendarComponentProps = {
  // A fixed mode for a context that always wants the same view (e.g. the
  // index page's compact card). Omit to auto-detect MONTH on desktop /
  // AGENDA on mobile once, on mount — not on every resize — so resizing the
  // window doesn't reload the iframe and lose whatever view was navigated to.
  mode?: CalendarMode;
  className?: string;
};

export const PersonalCalendarComponent = ({
  mode,
  className,
}: PersonalCalendarComponentProps) => {
  const [autoMode] = useState<CalendarMode>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia(MOBILE_VIEWPORT_QUERY).matches
      ? 'AGENDA'
      : 'MONTH',
  );
  const [eventCalendars, setEventCalendars] = useState<EventCalendar[]>([]);
  const { hiddenIds } = useCalendarViewEventCalendars();

  useEffect(() => {
    authFetch(API_ENDPOINTS.EVENT_CALENDARS)
      .then(response => (response.ok ? response.json() : null))
      .then(data => data && setEventCalendars(data.calendars))
      .catch(() => undefined);
  }, []);

  const src = useMemo(
    () =>
      buildEventCalendarEmbedUrl({
        mode: mode ?? autoMode,
        eventCalendars: eventCalendars.map(calendar => ({
          hiddenKey: calendar.id,
          googleCalendarId: calendar.googleCalendarId,
        })),
        hiddenKeys: hiddenIds,
        baseConfig: BASE_CALENDAR_CONFIG,
      }),
    [mode, autoMode, eventCalendars, hiddenIds],
  );

  return (
    <div className={className}>
      <iframe
        src={src}
        className="w-full h-full dark:invert dark:hue-rotate-180"
        style={{ border: 'none' }}
      />
    </div>
  );
};
