import {
  detectEventSourceType,
  EVENT_SOURCE_TYPE,
  EventCalendarSource,
  EventSourceType,
  isWebPageSourceUrl,
} from '../../constants/event-calendars';

interface IncomingSource {
  url?: string;
  sourceType?: string;
}

const isExplicitHttpSourceType = (
  sourceType?: string,
): sourceType is EventSourceType =>
  sourceType === EVENT_SOURCE_TYPE.WEB_PAGE ||
  sourceType === EVENT_SOURCE_TYPE.ICAL_FEED;

export type NormalizeSourcesResult =
  { ok: true; sources: EventCalendarSource[] } | { ok: false; error: string };

// The client sends raw URLs; the source type is inferred so adding a new
// scraper only means teaching detectEventSourceType about its URL shape. A URL
// matching no known pattern is rejected rather than assumed to be a Facebook
// group (the Facebook scraper drives a real browser loaded with the operator's
// session cookies). The exception is a non-Facebook http(s) URL the client
// explicitly marks as a web page or iCal feed (feeds whose URL does not end in
// .ics, found by the bookmarklet), which is fetched with a plain request.
export const normalizeSources = (
  sources: IncomingSource[],
): NormalizeSourcesResult => {
  const normalized: EventCalendarSource[] = [];
  for (const source of sources) {
    const url = source.url?.trim();
    if (!url) continue;
    const sourceType =
      detectEventSourceType(url) ??
      (isExplicitHttpSourceType(source.sourceType) && isWebPageSourceUrl(url)
        ? source.sourceType
        : null);
    if (!sourceType) {
      return { ok: false, error: `Unrecognized source URL: ${url}` };
    }
    normalized.push({ url, sourceType });
  }
  return { ok: true, sources: normalized };
};
