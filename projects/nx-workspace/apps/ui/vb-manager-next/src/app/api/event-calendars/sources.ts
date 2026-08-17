import {
  detectEventSourceType,
  EventCalendarSource,
} from '../../constants/event-calendars';

interface IncomingSource {
  url?: string;
  sourceType?: string;
}

export type NormalizeSourcesResult =
  | { ok: true; sources: EventCalendarSource[] }
  | { ok: false; error: string };

// The client sends raw URLs; the source type is inferred so adding a new
// scraper only means teaching detectEventSourceType about its URL shape. A
// URL that matches none of the known patterns is rejected rather than
// assumed to be a Facebook group — the scraper drives a real browser loaded
// with the operator's session cookies, so unrecognized URLs must not be
// silently accepted.
export const normalizeSources = (
  sources: IncomingSource[],
): NormalizeSourcesResult => {
  const urls = sources
    .map(source => source.url?.trim())
    .filter((url): url is string => !!url);

  const normalized: EventCalendarSource[] = [];
  for (const url of urls) {
    const sourceType = detectEventSourceType(url);
    if (!sourceType) {
      return { ok: false, error: `Unrecognized source URL: ${url}` };
    }
    normalized.push({ url, sourceType });
  }
  return { ok: true, sources: normalized };
};
