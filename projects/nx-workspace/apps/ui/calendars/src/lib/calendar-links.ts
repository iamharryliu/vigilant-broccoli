import { GOOGLE_CALENDAR_EMBED_URL } from './calendars.consts';
import { CalendarViewMode } from './calendars.types';

export const buildGoogleCalendarUrl = (googleCalendarId: string) =>
  `${GOOGLE_CALENDAR_EMBED_URL}?src=${encodeURIComponent(googleCalendarId)}`;

export const withViewMode = (url: string, mode: CalendarViewMode) =>
  `${url}&mode=${mode}`;
