'use client';

import { useEffect, useState } from 'react';
import { SecurityNewsList } from '@vigilant-broccoli/react-lib-higher-level';
import { SecurityNewsResponse } from '@vigilant-broccoli/security-news';
import { authFetch } from '../providers/auth-provider';

const SECURITY_NEWS_API = '/api/security-news';
const FETCH_ERROR = 'Failed to fetch security news';

export const SecurityNewsView = () => {
  const [data, setData] = useState<SecurityNewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch(SECURITY_NEWS_API)
      .then(response => {
        if (!response.ok) throw new Error(FETCH_ERROR);
        return response.json() as Promise<SecurityNewsResponse>;
      })
      .then(setData)
      .catch(() => setError(FETCH_ERROR))
      .finally(() => setLoading(false));
  }, []);

  return <SecurityNewsList data={data} loading={loading} error={error} />;
};
