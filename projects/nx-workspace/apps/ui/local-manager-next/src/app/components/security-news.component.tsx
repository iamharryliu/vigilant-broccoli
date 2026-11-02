'use client';

import { Badge, Text } from '@vigilant-broccoli/react-lib';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { usePolledResource } from '../hooks/usePolledResource';

const POLL_INTERVAL_MS = 30 * 60 * 1000;
const LOOKBACK_LABEL = 'last 7 days';

type SecurityNewsItem = {
  title: string;
  source: string;
  product: string;
  reason: string;
  link: string;
  published: number;
};

type SecurityNewsResponse = {
  items: SecurityNewsItem[];
  failedFeeds: string[];
  checkedFeeds: number;
  fetchedAt: number;
};

export const SecurityNewsComponent = () => {
  const { data, loading, error } = usePolledResource<SecurityNewsResponse>({
    endpoint: API_ENDPOINTS.SECURITY_NEWS,
    intervalMs: POLL_INTERVAL_MS,
    errorMessage: 'Failed to fetch security news',
  });

  return (
    <div className="flex flex-col gap-4 p-4 overflow-auto">
      <Text size="2" color="gray">
        Exploitable or large-scale issues affecting the stack ({LOOKBACK_LABEL}
        ). Routine releases and news are filtered out.
      </Text>
      {loading && <Text>Loading…</Text>}
      {error && <Text color="red">{error}</Text>}
      {data && data.items.length === 0 && <Text>Nothing big to report.</Text>}
      {data?.items.map(item => (
        <div
          key={item.link}
          className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-800 pb-3"
        >
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            {item.title}
          </a>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="red" size="1">
              {item.reason}
            </Badge>
            <Badge color="gray" size="1">
              {item.product}
            </Badge>
            <Text size="1" color="gray">
              {item.source} · {new Date(item.published).toLocaleDateString()}
            </Text>
          </div>
        </div>
      ))}
      {data && data.failedFeeds.length > 0 && (
        <Text size="1" color="orange">
          {data.failedFeeds.length} of {data.checkedFeeds} feeds failed:{' '}
          {data.failedFeeds.join(', ')}
        </Text>
      )}
    </div>
  );
};
