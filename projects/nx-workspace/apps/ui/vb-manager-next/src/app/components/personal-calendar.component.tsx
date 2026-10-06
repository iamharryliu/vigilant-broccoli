'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildCalendarUrl,
  CalendarConfig,
  GOOGLE_CALENDAR,
} from '@vigilant-broccoli/common-browser';
import { MultiSelect } from '@vigilant-broccoli/react-lib';
import { authFetch } from '../../../libs/auth';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { EventCalendar } from '../constants/event-calendars';

const BIRTHDAYS_CALENDAR =
  'f61b08e940f7c4fb8becf0d419c8c09f7e0c46d6d03343637aef5837c766a09b@group.calendar.google.com';

// Matches the `md` breakpoint used elsewhere in the app (e.g. Sidebar's
// narrow-viewport check) so "mobile" means the same thing everywhere.
const MOBILE_VIEWPORT_QUERY = '(max-width: 767px)';

const HIDDEN_CALENDARS_STORAGE_KEY = 'personal-calendar-hidden-ids';
const CALENDARS_PLACEHOLDER = 'Calendars';

const CALENDAR_LABEL: Record<string, string> = {
  [GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL]: 'Personal',
  [GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK]: 'Work',
  [GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN]:
    'Holidays in Sweden',
  [GOOGLE_CALENDAR.PUBLIC_CALENDAR.PHASES_OF_THE_MOON]: 'Phases of the Moon',
  [BIRTHDAYS_CALENDAR]: 'Birthdays',
  [GOOGLE_CALENDAR.PUBLIC_CALENDAR.H_AND_K]: 'H & K',
};

// Colors not already claimed by BASE_CALENDAR_CONFIG below, so an event
// calendar never visually matches a personal/work/public one. Cycled if
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
  ownerCalendars: [
    {
      email: GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.GREEN,
    },
    {
      email: GOOGLE_CALENDAR.CALENDAR_EMAIL.WORK,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.RED,
    },
  ],
  sharedCalendars: [
    {
      id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.COUNTRY_CALENDAR.SWEDEN,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.PURPLE,
    },
    {
      id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.PHASES_OF_THE_MOON,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.DARK_PINK,
    },
    {
      id: BIRTHDAYS_CALENDAR,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.BLUE,
    },
    {
      id: GOOGLE_CALENDAR.PUBLIC_CALENDAR.H_AND_K,
      color: GOOGLE_CALENDAR.CALENDAR_COLOR.PINK,
    },
  ],
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
  const [isMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(MOBILE_VIEWPORT_QUERY).matches,
  );
  const autoMode: CalendarMode = isMobile ? 'AGENDA' : 'MONTH';
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [eventCalendars, setEventCalendars] = useState<EventCalendar[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(HIDDEN_CALENDARS_STORAGE_KEY) ?? '[]',
      );
      if (Array.isArray(stored)) setHiddenIds(stored);
    } catch {
      // Corrupt stored value: fall back to showing every calendar.
    }
  }, []);

  useEffect(() => {
    authFetch(API_ENDPOINTS.EVENT_CALENDARS)
      .then(response => (response.ok ? response.json() : null))
      .then(data => data && setEventCalendars(data.calendars))
      .catch(() => undefined);
  }, []);

  const calendarOptions = useMemo(
    () => [
      ...BASE_CALENDAR_CONFIG.ownerCalendars.map(({ email }) => ({
        id: email,
        name: CALENDAR_LABEL[email] ?? email,
      })),
      ...BASE_CALENDAR_CONFIG.sharedCalendars.map(({ id }) => ({
        id,
        name: CALENDAR_LABEL[id] ?? id,
      })),
      ...eventCalendars.map(calendar => ({
        id: calendar.googleCalendarId,
        name: calendar.name,
      })),
    ],
    [eventCalendars],
  );

  const showCalendarPicker = isMobile && !mode;

  const selectedIds = calendarOptions
    .map(option => option.id)
    .filter(id => !hiddenIds.includes(id));

  const handleSelectionChange = (ids: string[]) => {
    const nextHidden = calendarOptions
      .map(option => option.id)
      .filter(id => !ids.includes(id));
    setHiddenIds(nextHidden);
    localStorage.setItem(
      HIDDEN_CALENDARS_STORAGE_KEY,
      JSON.stringify(nextHidden),
    );
  };

  const calendarConfig = useMemo<CalendarConfig>(() => {
    const isVisible = (id: string) =>
      !showCalendarPicker || !hiddenIds.includes(id);
    return {
      ...BASE_CALENDAR_CONFIG,
      mode: mode ?? autoMode,
      ownerCalendars: BASE_CALENDAR_CONFIG.ownerCalendars.filter(({ email }) =>
        isVisible(email),
      ),
      sharedCalendars: [
        ...BASE_CALENDAR_CONFIG.sharedCalendars,
        ...eventCalendars.map((calendar, index) => ({
          id: calendar.googleCalendarId,
          color: EVENT_CALENDAR_COLORS[index % EVENT_CALENDAR_COLORS.length],
        })),
      ].filter(({ id }) => isVisible(id)),
    };
  }, [mode, autoMode, eventCalendars, hiddenIds, showCalendarPicker]);

  return (
    <div
      className={`${showCalendarPicker ? 'flex flex-col gap-2' : ''} ${className ?? ''}`}
    >
      {showCalendarPicker && (
        <MultiSelect
          values={selectedIds}
          options={calendarOptions}
          onValueChange={handleSelectionChange}
          displayKey="name"
          placeholder={CALENDARS_PLACEHOLDER}
        />
      )}
      <iframe
        src={buildCalendarUrl(calendarConfig)}
        className="w-full flex-1 min-h-0 h-full dark:invert dark:hue-rotate-180"
        style={{ border: 'none' }}
      />
    </div>
  );
};
