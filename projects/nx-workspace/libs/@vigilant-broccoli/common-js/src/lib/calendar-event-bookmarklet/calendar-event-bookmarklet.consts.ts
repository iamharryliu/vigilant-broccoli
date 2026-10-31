// The calendar-event bookmarklet posts a page's content to local-manager-next or
// mobile-manager-next, which acknowledges it. Installed bookmarklets carry
// these values, so changing one breaks them until they are reinstalled.
export const CALENDAR_EVENT_BOOKMARKLET = {
  MESSAGE_SOURCE: 'calendar-event-bookmarklet',
  ACK: 'calendar-event-ack',
  // The bookmarklet opens the manager's home page with this query param set.
  TARGET_PARAM: 'calendar-event-bookmarklet',
} as const;

export type CalendarEventBookmarkletMessage = {
  source: typeof CALENDAR_EVENT_BOOKMARKLET.MESSAGE_SOURCE;
  url: string;
  title?: string;
  selection?: string;
  structuredData?: string[];
  text?: string;
};

export const isCalendarEventBookmarkletMessage = (
  data: unknown,
): data is CalendarEventBookmarkletMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as CalendarEventBookmarkletMessage).source ===
    CALENDAR_EVENT_BOOKMARKLET.MESSAGE_SOURCE;
