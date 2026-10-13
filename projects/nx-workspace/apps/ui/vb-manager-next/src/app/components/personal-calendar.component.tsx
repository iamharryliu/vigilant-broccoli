'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';
import { PERSONAL_CALENDAR_SOURCES } from '@vigilant-broccoli/personal-common-js';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { EventCalendar } from '../constants/event-calendars';
import { useCalendarViewEventCalendars } from '../hooks/useCalendarViewEventCalendars';

// Matches the `md` breakpoint used elsewhere in the app (e.g. Sidebar's
// narrow-viewport check) so "mobile" means the same thing everywhere.
const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';

// Colors not already claimed by BASE_CALENDAR_CONFIG below, so an event
// calendar never visually matches a personal/public one. Cycled if
// there are more event calendars than spare colors.
const EVENT_CALENDAR_COLORS = [
  GOOGLE_CALENDAR.CALENDAR_COLOR.LIGHT_BLUE,
  GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_GREEN,
];

const BASE_CALENDAR_CONFIG: Omit<CalendarConfig, 'mode'> = {
  height: 600,
  wkst: 2,
  ctz: GOOGLE_CALENDAR.TIMEZONE.COPENHAGEN,
  showPrint: 0,
  title: 'Personal Calendar',
  ownerCalendars: PERSONAL_CALENDAR_SOURCES.filter(
    source => source.kind === 'owner',
  ).map(source => ({ email: source.id, color: source.color })),
  sharedCalendars: PERSONAL_CALENDAR_SOURCES.filter(
    source => source.kind === 'shared',
  ).map(source => ({ id: source.id, color: source.color })),
};

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

  const calendarConfig = useMemo<CalendarConfig>(
    () => ({
      ...BASE_CALENDAR_CONFIG,
      mode: mode ?? autoMode,
      sharedCalendars: [
        ...BASE_CALENDAR_CONFIG.sharedCalendars,
        // Colors are assigned before filtering so hiding one calendar doesn't
        // recolor the rest.
        ...eventCalendars
          .map((calendar, index) => ({
            calendar,
            color: EVENT_CALENDAR_COLORS[index % EVENT_CALENDAR_COLORS.length],
          }))
          .filter(({ calendar }) => !hiddenIds.includes(calendar.id))
          .map(({ calendar, color }) => ({
            id: calendar.googleCalendarId,
            color,
          })),
      ],
    }),
    [mode, autoMode, eventCalendars, hiddenIds],
  );

  return (
    <div className={className}>
      <iframe
        src={buildCalendarUrl(calendarConfig)}
        className="w-full h-full dark:invert dark:hue-rotate-180"
        style={{ border: 'none' }}
      />
    </div>
  );
};
