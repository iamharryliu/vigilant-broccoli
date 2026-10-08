import { GOOGLE_CALENDAR } from '@vigilant-broccoli/common-browser';

export const GOOGLE_CALENDAR_EMBED_URL =
  'https://calendar.google.com/calendar/embed';

export const CALENDAR_VIEW_MODE = {
  AGENDA: 'AGENDA',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
} as const;

export const PERSONAL_CALENDARS = [
  {
    id: 'harry',
    name: "Harry's Calendar",
    googleCalendarId: GOOGLE_CALENDAR.CALENDAR_EMAIL.PERSONAL,
  },
];

export const EVENT_CALENDARS_TABLE = 'event_calendars';

export const LOAD_STATUS = {
  OK: 'OK',
  ERROR: 'ERROR',
} as const;

export const CALENDAR_SECTION_STATE = {
  READY: 'READY',
  LOADING: 'LOADING',
  ERROR: 'ERROR',
} as const;
