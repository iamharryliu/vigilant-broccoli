// The calendar-event bookmarklet posts a page's content to local-manager-next or
// mobile-manager-next, which acknowledges it. Installed bookmarklets carry
// these values, so changing one breaks them until they are reinstalled.
export const CALENDAR_EVENT_BOOKMARKLET = {
  MESSAGE_SOURCE: 'calendar-event-bookmarklet',
  ACK: 'calendar-event-ack',
  // The bookmarklet opens the manager's home page with this query param set.
  TARGET_PARAM: 'calendar-event-bookmarklet',
  // What the click is for. A message without an intent (bookmarklets installed
  // before this existed) is a one-off event.
  INTENT: { EVENT: 'event', SOURCE: 'source' },
} as const;

export type CalendarEventBookmarkletIntent =
  (typeof CALENDAR_EVENT_BOOKMARKLET.INTENT)[keyof typeof CALENDAR_EVENT_BOOKMARKLET.INTENT];

export type CalendarEventBookmarkletMessage = {
  source: typeof CALENDAR_EVENT_BOOKMARKLET.MESSAGE_SOURCE;
  intent?: CalendarEventBookmarkletIntent;
  url: string;
  title?: string;
  selection?: string;
  structuredData?: string[];
  // Calendar feed links (.ics, webcal:) found on the page, and the subset the
  // page declares with <link type="text/calendar">.
  feedUrls?: string[];
  declaredFeedUrls?: string[];
  text?: string;
};

export const isCalendarEventBookmarkletMessage = (
  data: unknown,
): data is CalendarEventBookmarkletMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as CalendarEventBookmarkletMessage).source ===
    CALENDAR_EVENT_BOOKMARKLET.MESSAGE_SOURCE;
