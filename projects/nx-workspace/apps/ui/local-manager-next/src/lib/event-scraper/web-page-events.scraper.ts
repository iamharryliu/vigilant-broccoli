import { scrapeIcalEvents } from './ical-events.scraper';
import {
  buildExternalEventId,
  CALENDAR_TIME_ZONE,
  DEFAULT_EVENT_DURATION_HOURS,
  addDays,
  addHours,
  formatDateOnly,
  formatLocalDateTime,
} from './event-time';
import { requestLlmJson } from './llm-json';
import { ScrapedEvent } from './scraped-event.types';

const FETCH_TIMEOUT_MS = 30000;
const MAX_PAGE_TEXT_LENGTH = 30000;
const SECTION_UPCOMING = 'upcoming';
const USER_AGENT = 'Mozilla/5.0 (compatible; vb-manager event importer)';
const CALENDAR_LINK_PATTERN =
  /<link\b[^>]*type=["']text\/calendar["'][^>]*>|<a\b[^>]*href=["'][^"']+\.ics(?:\?[^"']*)?["'][^>]*>/gi;
const HREF_PATTERN = /href=["']([^"']+)["']/i;
const JSON_LD_PATTERN =
  /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ZONE_SUFFIX_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/;

interface ExtractedEvent {
  title: string;
  // "YYYY-MM-DDTHH:mm" in the venue's local time, or "YYYY-MM-DD" when no
  // time is given.
  start: string;
  end: string;
  location: string;
  description: string;
  url: string;
}

const EXTRACTION_SYSTEM_PROMPT = `You extract upcoming events from the text of a web page.
Return {"events": [...]} with one entry per distinct event listed on the page.
- "title": the event's name.
- "start": local start as "YYYY-MM-DDTHH:mm" (24-hour), or "YYYY-MM-DD" when the page gives no time. Infer a missing year from today's date so the event is the next upcoming occurrence.
- "end": local end in the same format, or an empty string when unknown.
- "location": venue and address if given, else an empty string.
- "description": a short plain-text description, else an empty string.
- "url": a link specific to the event if the page shows one, else an empty string.
Skip cancelled events and events already over. Never invent events; return an empty list when the page lists none.`;

const EXTRACTION_SCHEMA = {
  name: 'page_events',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['events'],
    properties: {
      events: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['title', 'start', 'end', 'location', 'description', 'url'],
          properties: {
            title: { type: 'string' },
            start: { type: 'string' },
            end: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            url: { type: 'string' },
          },
        },
      },
    },
  },
} as const;

const fetchPage = async (url: string) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
};

const resolveUrl = (href: string, base: string) => {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
};

const findCalendarFeedUrls = (html: string, pageUrl: string) => [
  ...new Set(
    (html.match(CALENDAR_LINK_PATTERN) ?? [])
      .map(tag => tag.match(HREF_PATTERN)?.[1])
      .filter((href): href is string => !!href)
      .map(href => resolveUrl(href, pageUrl))
      .filter((url): url is string => !!url),
  ),
];

// Accepts "2026-11-14", an offset-less local time, or a full ISO instant.
const normalizeIsoMoment = (value: string, allowDateOnly: boolean) => {
  if (DATE_ONLY_PATTERN.test(value)) {
    return allowDateOnly ? { allDay: true, value } : null;
  }
  if (ZONE_SUFFIX_PATTERN.test(value)) {
    const instant = new Date(value).getTime();
    return Number.isNaN(instant)
      ? null
      : { allDay: false, value: formatLocalDateTime(instant) };
  }
  const local = value.length === 16 ? `${value}:00` : value.slice(0, 19);
  return Number.isNaN(new Date(local).getTime())
    ? null
    : { allDay: false, value: local };
};

const localToUtcMs = (local: string) => new Date(`${local}Z`).getTime();

const buildPageEvent = (
  event: ExtractedEvent,
  pageUrl: string,
): ScrapedEvent | null => {
  const start = normalizeIsoMoment(event.start, true);
  if (!event.title?.trim() || !start) return null;
  const end = event.end ? normalizeIsoMoment(event.end, true) : null;

  const common = {
    id: buildExternalEventId(pageUrl, event.title.trim(), start.value),
    external: true,
    title: event.title.trim(),
    location: event.location || undefined,
    description: event.description || undefined,
    section: SECTION_UPCOMING,
    url: resolveUrl(event.url, pageUrl) ?? pageUrl,
  };

  if (start.allDay) {
    const minEnd = addDays(localToUtcMs(start.value), 1);
    const endMs = end?.allDay ? addDays(localToUtcMs(end.value), 1) : minEnd;
    return {
      ...common,
      allDay: true,
      start: start.value,
      end: formatDateOnly(Math.max(endMs, minEnd)),
    };
  }

  const startMs = localToUtcMs(start.value);
  const endMs =
    end && !end.allDay && localToUtcMs(end.value) > startMs
      ? localToUtcMs(end.value)
      : addHours(startMs, DEFAULT_EVENT_DURATION_HOURS);
  return {
    ...common,
    start: start.value,
    end: new Date(endMs).toISOString().slice(0, 19),
  };
};

const collectJsonLdEvents = (node: unknown): Record<string, unknown>[] => {
  if (Array.isArray(node)) return node.flatMap(collectJsonLdEvents);
  if (!node || typeof node !== 'object') return [];
  const record = node as Record<string, unknown>;
  const types = [record['@type']].flat().map(String);
  const nested = Object.values(record).flatMap(collectJsonLdEvents);
  return types.some(type => type.endsWith('Event'))
    ? [record, ...nested]
    : nested;
};

const formatJsonLdLocation = (location: unknown) => {
  const place = [location].flat()[0] as Record<string, unknown> | undefined;
  if (!place || typeof place !== 'object') return '';
  const address = place.address;
  const addressText =
    typeof address === 'string'
      ? address
      : address && typeof address === 'object'
        ? ['streetAddress', 'addressLocality']
            .map(key => (address as Record<string, unknown>)[key])
            .filter(Boolean)
            .join(', ')
        : '';
  return [place.name, addressText].filter(Boolean).join(', ');
};

const extractJsonLdEvents = (html: string, pageUrl: string) => {
  const extracted: ExtractedEvent[] = [];
  for (const match of html.matchAll(JSON_LD_PATTERN)) {
    try {
      for (const event of collectJsonLdEvents(JSON.parse(match[1]))) {
        extracted.push({
          title: String(event.name ?? ''),
          start: String(event.startDate ?? ''),
          end: String(event.endDate ?? ''),
          location: formatJsonLdLocation(event.location),
          description: String(event.description ?? ''),
          url: String(event.url ?? ''),
        });
      }
    } catch {
      // Malformed JSON-LD blocks are common; the other strategies still run.
    }
  }
  return extracted
    .map(event => buildPageEvent(event, pageUrl))
    .filter((event): event is ScrapedEvent => !!event);
};

const htmlToText = (html: string) =>
  html
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>|<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
    .slice(0, MAX_PAGE_TEXT_LENGTH);

const extractEventsWithLlm = async (html: string, pageUrl: string) => {
  const output = await requestLlmJson<{ events: ExtractedEvent[] }>({
    systemPrompt: EXTRACTION_SYSTEM_PROMPT,
    userPrompt: [
      `Today: ${new Date().toISOString().slice(0, 10)} (${CALENDAR_TIME_ZONE})`,
      `Page: ${pageUrl}`,
      `Text:\n${htmlToText(html)}`,
    ].join('\n'),
    jsonSchema: EXTRACTION_SCHEMA,
  });
  return (output?.events ?? [])
    .map(event => buildPageEvent(event, pageUrl))
    .filter((event): event is ScrapedEvent => !!event);
};

// A feed holding exactly one event is a per-event file the page links next to
// each listing (hejtide's /dips/<date>-<slug>.ics); anything larger is a master
// feed.
const SINGLE_EVENT_FEED_SIZE = 1;
const MAX_LINKED_FEEDS = 60;
const FEED_FETCH_CONCURRENCY = 8;

const fetchLinkedFeeds = async (feedUrls: string[]) => {
  const feeds: ScrapedEvent[][] = [];
  for (
    let index = 0;
    index < feedUrls.length;
    index += FEED_FETCH_CONCURRENCY
  ) {
    feeds.push(
      ...(await Promise.all(
        feedUrls
          .slice(index, index + FEED_FETCH_CONCURRENCY)
          .map(feedUrl => scrapeIcalEvents({ feedUrl }).catch(() => [])),
      )),
    );
  }
  return feeds;
};

const dedupeById = (events: ScrapedEvent[]) => [
  ...new Map(events.map(event => [event.id, event])).values(),
];

// A master feed can lag the page (it may omit events the page lists), so when
// the page links per-event files those are the page's own list and are used
// alone; otherwise the largest master feed is used.
const eventsFromLinkedFeeds = (feeds: ScrapedEvent[][]) => {
  const perEvent = feeds.filter(
    events => events.length === SINGLE_EVENT_FEED_SIZE,
  );
  if (perEvent.length) return dedupeById(perEvent.flat());
  return feeds.reduce<ScrapedEvent[]>(
    (largest, events) => (events.length > largest.length ? events : largest),
    [],
  );
};

// Tries the cheapest, most reliable source first: the calendar files the page
// links to, then schema.org Event markup, then LLM extraction from the text.
export const scrapeWebPageEvents = async ({
  pageUrl,
}: {
  pageUrl: string;
}): Promise<ScrapedEvent[]> => {
  const html = await fetchPage(pageUrl);

  const linked = eventsFromLinkedFeeds(
    await fetchLinkedFeeds(
      findCalendarFeedUrls(html, pageUrl).slice(0, MAX_LINKED_FEEDS),
    ),
  );
  if (linked.length) return linked;

  const structured = extractJsonLdEvents(html, pageUrl);
  if (structured.length) return structured;

  return extractEventsWithLlm(html, pageUrl);
};
