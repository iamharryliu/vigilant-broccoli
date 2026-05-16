'use client';

import { Badge, Flex, Link } from '@radix-ui/themes';
import {
  buttonVariants,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

interface FlyApp {
  name: string;
  status: string;
}

interface FlyAppsResponse {
  success: boolean;
  apps?: FlyApp[];
  error?: string;
}

const getStatusColor = (
  status: string,
): 'green' | 'yellow' | 'red' | 'gray' => {
  const s = status.toLowerCase();
  if (s === 'deployed' || s === 'running') return 'green';
  if (s === 'suspended') return 'yellow';
  if (s === 'pending') return 'gray';
  return 'red';
};

const dashboardLink = (
  <Link
    href="https://fly.io/dashboard"
    target="_blank"
    rel="noopener noreferrer"
    size="2"
  >
    <Flex align="center" gap="1">
      Dashboard
      <ExternalLinkIcon width="12" height="12" />
    </Flex>
  </Link>
);

const toItem = (app: FlyApp): StatusCardListItem => ({
  id: app.name,
  label: app.name,
  badges: (
    <Badge color={getStatusColor(app.status)} size="1">
      {app.status}
    </Badge>
  ),
  children: (
    <a
      href={`https://fly.io/apps/${app.name}`}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: 'secondary', size: 'sm' })}
    >
      fly.io/apps/{app.name}
      <ExternalLinkIcon width="12" height="12" />
    </a>
  ),
});

export const FlyIoAppsComponent = () => {
  const [appsData, setAppsData] = useState<FlyApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlyApps = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.FLYIO_APPS);
        const data: FlyAppsResponse = await response.json();
        if (!data.success || !data.apps)
          throw new Error(data.error || 'Failed to fetch Fly.io apps');
        setAppsData(data.apps);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch Fly.io apps',
        );
        setLoading(false);
        console.error('Fly.io apps fetch error:', err);
      }
    };

    fetchFlyApps();
    const interval = setInterval(fetchFlyApps, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <CardSkeleton title="Fly.io Apps" rows={5} />;

  if (error) {
    return (
      <CardContainer title="Fly.io Apps" gap="3" headerAction={dashboardLink}>
        <Badge color="red">{error}</Badge>
      </CardContainer>
    );
  }

  return (
    <CardContainer title="Fly.io Apps" gap="3" headerAction={dashboardLink}>
      <StatusCardList
        items={appsData.map(toItem)}
        emptyMessage="No apps found"
      />
    </CardContainer>
  );
};
