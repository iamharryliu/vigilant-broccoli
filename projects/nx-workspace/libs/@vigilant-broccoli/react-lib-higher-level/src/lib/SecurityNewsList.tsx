import { Badge, Text } from '@vigilant-broccoli/react-lib';
import {
  LOOKBACK_DAYS,
  SecurityNewsResponse,
} from '@vigilant-broccoli/security-news';

interface SecurityNewsListProps {
  data: SecurityNewsResponse | null;
  loading: boolean;
  error: string | null;
}

export const SecurityNewsList = ({
  data,
  loading,
  error,
}: SecurityNewsListProps) => (
  <div className="flex min-h-0 flex-col gap-4 overflow-auto p-4">
    <Text size="2" color="gray">
      Exploitable or large-scale issues affecting the stack (last{' '}
      {LOOKBACK_DAYS} days). Routine releases and news are filtered out.
    </Text>
    {loading && <Text>Loading…</Text>}
    {error && <Text color="red">{error}</Text>}
    {data && data.items.length === 0 && <Text>Nothing big to report.</Text>}
    {data?.items.map(item => (
      <div
        key={item.link}
        className="flex flex-col gap-1 border-b border-gray-200 pb-3 dark:border-gray-800"
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
