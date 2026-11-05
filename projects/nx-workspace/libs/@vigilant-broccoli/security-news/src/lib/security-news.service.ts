import { Feed, FEED_FORMAT, FEEDS } from './security-news.feeds';
import { matchSecurityItems, SecurityNewsItem } from './security-news.match';
import { FeedItem, parseFeed } from './security-news.parse';

const FETCH_TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 30 * 60 * 1000;
const USER_AGENT = 'vigilant-broccoli-security-news/1.0';
const GITHUB_ACCEPT = 'application/vnd.github+json';
const ANY_ACCEPT = '*/*';

export type SecurityNewsResponse = {
  items: SecurityNewsItem[];
  failedFeeds: string[];
  checkedFeeds: number;
  fetchedAt: number;
};

let cache: SecurityNewsResponse | null = null;

const fetchFeed = async (feed: Feed): Promise<FeedItem[]> => {
  const response = await fetch(feed.url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept:
        feed.format === FEED_FORMAT.GITHUB_ADVISORIES
          ? GITHUB_ACCEPT
          : ANY_ACCEPT,
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: 'no-store',
  });
  if (!response.ok)
    throw new Error(`${response.status} ${response.statusText}`);
  return parseFeed(await response.text(), feed);
};

const loadSecurityNews = async (): Promise<SecurityNewsResponse> => {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const failedFeeds = results.flatMap((result, index) =>
    result.status === 'rejected' ? [FEEDS[index].name] : [],
  );
  const items = results.flatMap(result =>
    result.status === 'fulfilled' ? result.value : [],
  );
  return {
    items: matchSecurityItems(items),
    failedFeeds,
    checkedFeeds: FEEDS.length,
    fetchedAt: Date.now(),
  };
};

export const getSecurityNews = async (): Promise<SecurityNewsResponse> => {
  if (!cache || Date.now() - cache.fetchedAt > CACHE_TTL_MS)
    cache = await loadSecurityNews();
  return cache;
};
