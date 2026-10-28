export const APP_NAME = 'VB Manager';

export const PAGE_TITLE = {
  HOME: 'Home',
  APPS: 'Apps',
  LOGIN: 'Login',
  AUTH_CALLBACK: 'Signing In',
} as const;

export const APP_ROUTE = {
  HOME: '/',
  APPS: '/apps',
} as const;

export const CALENDAR_TAB = {
  CALENDAR: 'Calendar',
  EVENT_CALENDARS: 'Event Calendars',
  TASKS: 'Tasks',
  NOTEPAD: 'Notepad',
  QUICK_LINKS: 'Quick Links',
  WEATHER: 'Weather',
} as const;

export type CalendarTab = (typeof CALENDAR_TAB)[keyof typeof CALENDAR_TAB];

export const CALENDAR_TAB_QUERY_PARAM = 'tab';

export const WEATHER_QUERY_PARAM = {
  LAT: 'lat',
  LON: 'lon',
} as const;
