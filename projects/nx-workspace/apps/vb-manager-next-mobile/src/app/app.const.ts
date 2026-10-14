export const APP_NAME = 'VB Manager';

export const PAGE_TITLE = {
  HOME: 'My Calendar',
  TASK_LIST: 'My Tasks',
  TRANSCRIBE: 'Transcribe',
  OCR: 'Scan',
  QR: 'QR Reader',
  NOTEPAD: 'Notepad',
  PASTEBIN: 'Pastebin',
  WEATHER: 'Weather',
  LOGIN: 'Login',
  AUTH_CALLBACK: 'Signing In',
} as const;

export const CALENDAR_TAB = {
  CALENDAR: 'Calendar',
  EVENT_CALENDARS: 'Event Calendars',
} as const;

export type CalendarTab = (typeof CALENDAR_TAB)[keyof typeof CALENDAR_TAB];
