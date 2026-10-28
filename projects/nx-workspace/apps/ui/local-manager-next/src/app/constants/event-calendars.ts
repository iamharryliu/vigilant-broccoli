// Where a calendar's events get scraped from. Facebook group and page event
// listings share one scraper today (src/lib/event-scraper), which just drives a
// Facebook events URL; new source types get added here and taught to the scraper.
export const EVENT_SOURCE_TYPE = {
  FACEBOOK_GROUP: 'facebook_group',
  FACEBOOK_PAGE: 'facebook_page',
} as const;

export type EventSourceType =
  (typeof EVENT_SOURCE_TYPE)[keyof typeof EVENT_SOURCE_TYPE];

export const EVENT_SOURCE_TYPES = Object.values(EVENT_SOURCE_TYPE);

const FACEBOOK_GROUP_URL_PATTERN =
  /^https?:\/\/(www\.)?facebook\.com\/groups\//;
// A page's events listing, e.g. facebook.com/FNSCPH/events — any slug that
// isn't /groups/ followed by an /events segment.
const FACEBOOK_PAGE_URL_PATTERN =
  /^https?:\/\/(www\.)?facebook\.com\/(?!groups\/)[^/?#]+\/events\b/;

const SOURCE_TYPE_URL_PATTERN: Record<EventSourceType, RegExp> = {
  [EVENT_SOURCE_TYPE.FACEBOOK_GROUP]: FACEBOOK_GROUP_URL_PATTERN,
  [EVENT_SOURCE_TYPE.FACEBOOK_PAGE]: FACEBOOK_PAGE_URL_PATTERN,
};

export const detectEventSourceType = (url: string): EventSourceType | null =>
  EVENT_SOURCE_TYPES.find(type => SOURCE_TYPE_URL_PATTERN[type].test(url)) ??
  null;

// Stored as the language name since the sync's LLM prompt consumes it as-is.
export const EVENT_LANGUAGE = {
  ENGLISH: 'English',
  SWEDISH: 'Swedish',
  DANISH: 'Danish',
} as const;

export const EVENT_LANGUAGES: string[] = Object.values(EVENT_LANGUAGE);

export interface EventCalendarSource {
  url: string;
  sourceType: EventSourceType;
}

export interface EventCalendar {
  id: string;
  name: string;
  googleCalendarId: string;
  isPublic: boolean;
  language?: string;
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

// Order is the step order shown while a sync runs.
export const SYNC_PHASE = {
  SCRAPING: 'scraping',
  LOCALIZING: 'localizing',
  WRITING: 'writing',
} as const;

export type SyncPhase = (typeof SYNC_PHASE)[keyof typeof SYNC_PHASE];

export const SYNC_PHASE_ORDER: SyncPhase[] = [
  SYNC_PHASE.SCRAPING,
  SYNC_PHASE.LOCALIZING,
  SYNC_PHASE.WRITING,
];

export const SYNC_RUN_TRIGGER = {
  CLI: 'cli',
  UI: 'ui',
} as const;

export type SyncRunTrigger =
  (typeof SYNC_RUN_TRIGGER)[keyof typeof SYNC_RUN_TRIGGER];

export const SYNC_RUN_STATUS = {
  RUNNING: 'running',
  SUCCESS: 'success',
  PARTIAL: 'partial',
  FAILED: 'failed',
} as const;

export type SyncRunStatus =
  (typeof SYNC_RUN_STATUS)[keyof typeof SYNC_RUN_STATUS];

export interface SyncRunResult {
  calendarId: string;
  ok: boolean;
  message: string;
}

export interface SyncRun {
  id: string;
  trigger: SyncRunTrigger;
  status: SyncRunStatus;
  // A 'running' row with no heartbeat for SYNC_RUN_STALE_MS is reported as
  // failed with stale set, since its process is gone.
  stale: boolean;
  startedAt: string;
  finishedAt?: string;
  currentCalendarId?: string;
  results: SyncRunResult[];
}
