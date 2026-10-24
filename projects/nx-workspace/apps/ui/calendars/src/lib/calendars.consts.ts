import { PERSONAL_GOOGLE_CALENDAR } from '@harry/personal';

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

export const HIDDEN_EVENT_CALENDARS_STORAGE_KEY =
  'calendars-hidden-event-calendars';

export const TAB_STORAGE_KEY = 'calendars-active-tab';

export const TAB = {
  CALENDAR_VIEW: 'calendar-view',
  PERSONAL: 'personal',
  EVENT_CALENDARS: 'event-calendars',
} as const;
