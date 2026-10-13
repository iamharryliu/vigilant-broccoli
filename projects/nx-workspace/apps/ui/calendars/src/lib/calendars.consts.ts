import { PERSONAL_GOOGLE_CALENDAR } from '@vigilant-broccoli/personal-common-js';

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
    googleCalendarId: PERSONAL_GOOGLE_CALENDAR.PERSONAL,
  },
];

export const PUBLIC_EVENT_CALENDARS_PATH = '/api/public/event-calendars';

export const CALENDAR_SECTION_STATE = {
  READY: 'READY',
  LOADING: 'LOADING',
  ERROR: 'ERROR',
} as const;
