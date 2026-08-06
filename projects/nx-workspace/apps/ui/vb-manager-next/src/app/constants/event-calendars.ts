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
