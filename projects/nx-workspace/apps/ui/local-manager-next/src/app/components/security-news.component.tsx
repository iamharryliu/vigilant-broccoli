'use client';

import { SecurityNewsList } from '@vigilant-broccoli/react-lib-higher-level';
import { SecurityNewsResponse } from '@vigilant-broccoli/security-news';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { usePolledResource } from '../hooks/usePolledResource';

const POLL_INTERVAL_MS = 30 * 60 * 1000;

export const SecurityNewsComponent = () => {
  const { data, loading, error } = usePolledResource<SecurityNewsResponse>({
    endpoint: API_ENDPOINTS.SECURITY_NEWS,
    intervalMs: POLL_INTERVAL_MS,
    errorMessage: 'Failed to fetch security news',
  });

  return <SecurityNewsList data={data} loading={loading} error={error} />;
};
