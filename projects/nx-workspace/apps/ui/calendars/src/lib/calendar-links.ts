import { GOOGLE_CALENDAR_EMBED_URL } from './calendars.consts';
import { CalendarViewMode } from './calendars.types';

export const buildGoogleCalendarUrl = (googleCalendarId: string) =>
  `${GOOGLE_CALENDAR_EMBED_URL}?src=${encodeURIComponent(googleCalendarId)}`;

export const withViewMode = (url: string, mode: CalendarViewMode) =>
  `${url}&mode=${mode}`;

// The public endpoint builds `?src=<plain id>` links (see buildGoogleCalendarUrl
// in VB Express), so the Google calendar id is recoverable from the URL.
export const getGoogleCalendarId = (url: string) =>
  new URL(url).searchParams.get('src');
