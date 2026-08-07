// Where a calendar's events get scraped from. Facebook group event pages are
// the only implemented scraper today (src/lib/event-scraper);
// new source types get added here and taught to the scraper.
export const EVENT_SOURCE_TYPE = {
  FACEBOOK_GROUP: 'facebook_group',
} as const;

export type EventSourceType =
  (typeof EVENT_SOURCE_TYPE)[keyof typeof EVENT_SOURCE_TYPE];

export const EVENT_SOURCE_TYPE_LABEL: Record<EventSourceType, string> = {
  [EVENT_SOURCE_TYPE.FACEBOOK_GROUP]: 'Facebook group',
};

export const EVENT_SOURCE_TYPES = Object.values(EVENT_SOURCE_TYPE);

const FACEBOOK_GROUP_URL_PATTERN =
  /^https?:\/\/(www\.)?facebook\.com\/groups\//;

const SOURCE_TYPE_URL_PATTERN: Record<EventSourceType, RegExp> = {
  [EVENT_SOURCE_TYPE.FACEBOOK_GROUP]: FACEBOOK_GROUP_URL_PATTERN,
};

export const detectEventSourceType = (url: string): EventSourceType | null =>
  EVENT_SOURCE_TYPES.find(type => SOURCE_TYPE_URL_PATTERN[type].test(url)) ??
  null;

export interface EventCalendarSource {
  url: string;
  sourceType: EventSourceType;
}

export interface EventCalendar {
  id: string;
  name: string;
  googleCalendarId: string;
  isPublic: boolean;
  sources: EventCalendarSource[];
  createdAt: string;
  updatedAt: string;
  lastSyncedAt?: string;
  lastSyncMessage?: string;
}

export interface UntrackedCalendar {
  googleCalendarId: string;
  name: string;
  eventCount: number;
}

// Renders the calendar itself in Google Calendar. Works for private calendars
// too, since every calendar created here is shared to the signed-in user as
// owner — and for public ones the same link is shareable as-is.
const GOOGLE_CALENDAR_EMBED_URL = 'https://calendar.google.com/calendar/embed';

export const buildGoogleCalendarUrl = (googleCalendarId: string) =>
  `${GOOGLE_CALENDAR_EMBED_URL}?src=${encodeURIComponent(googleCalendarId)}`;
