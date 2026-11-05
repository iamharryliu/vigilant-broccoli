import { normalizeFeedUrl, scrapeIcalEvents } from './ical-events.scraper';

const MAX_PROBED_FEEDS = 12;
const SAMPLE_TITLE_COUNT = 3;
const FEED_URL_PATTERN = /^(https?|webcal):/i;
const WRAPPER_PARAMS = ['cid', 'url', 'src'];

export interface DetectedFeed {
  url: string;
  eventCount: number;
  titles: string[];
  declared: boolean;
}

// Subscribe buttons often wrap the feed, e.g. Google's
// calendar.google.com/calendar/render?cid=<feed url>; use the feed itself.
export const unwrapFeedUrl = (url: string) => {
  try {
    const { searchParams } = new URL(url);
    const wrapped = WRAPPER_PARAMS.map(param => searchParams.get(param)).find(
      value => value && FEED_URL_PATTERN.test(value),
    );
    return normalizeFeedUrl(wrapped ?? url);
  } catch {
    return normalizeFeedUrl(url);
  }
};

const probeFeed = async (
  url: string,
  declared: boolean,
): Promise<DetectedFeed> => {
  const events = await scrapeIcalEvents({ feedUrl: url }).catch(() => []);
  return {
    url,
    declared,
    eventCount: events.length,
    titles: [...new Set(events.map(event => event.title))].slice(
      0,
      SAMPLE_TITLE_COUNT,
    ),
  };
};

// The master calendar is the feed that contains the others, so after a feed the
// page explicitly declares, the one with the most upcoming events wins; the
// shortest URL breaks ties (/events.ics over /events/2026-11-04.ics).
export const detectFeeds = async (
  urls: string[],
  declaredUrls: string[] = [],
): Promise<DetectedFeed[]> => {
  const declared = new Set(declaredUrls.map(unwrapFeedUrl));
  const unique = [...new Set(urls.map(unwrapFeedUrl))]
    .filter(url => /^https?:/i.test(url))
    .slice(0, MAX_PROBED_FEEDS);
  const feeds = await Promise.all(
    unique.map(url => probeFeed(url, declared.has(url))),
  );
  return feeds.sort(
    (a, b) =>
      Number(b.declared) - Number(a.declared) ||
      b.eventCount - a.eventCount ||
      a.url.length - b.url.length,
  );
};
