'use client';

import { Flex, Link, Text } from '@radix-ui/themes';
import { useEffect, useState, useMemo } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { LinkList } from './link-list.component';
import { LinkListItemConfig } from './link-list-item.component';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
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

// Helper function to get status badge color
const getStatusColor = (
  status: string,
): 'green' | 'yellow' | 'red' | 'gray' => {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === 'deployed' || normalizedStatus === 'running')
    return 'green';
  if (normalizedStatus === 'suspended') return 'yellow';
  if (normalizedStatus === 'pending') return 'gray';
  return 'red';
};

export const FlyIoAppsComponent = () => {
  const [appsData, setAppsData] = useState<FlyApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const linkItems = useMemo<LinkListItemConfig[]>(() => {
    return appsData.map(app => ({
      text: app.name,
      url: `https://fly.io/apps/${app.name}`,
      badge: {
        text: app.status,
        color: getStatusColor(app.status),
      },
    }));
  }, [appsData]);

  useEffect(() => {
    const fetchFlyApps = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.FLYIO_APPS);
        const data: FlyAppsResponse = await response.json();

        if (!data.success || !data.apps) {
          throw new Error(data.error || 'Failed to fetch Fly.io apps');
        }

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
    // Refresh every 60 seconds
    const interval = setInterval(fetchFlyApps, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <CardSkeleton title="Fly.io Apps" rows={5} />;
  }

  if (error) {
    return (
      <CardContainer
        title="Fly.io Apps"
        gap="3"
        headerAction={
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
        }
      >
        <Text color="red">{error}</Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer
      title="Fly.io Apps"
      gap="3"
      headerAction={
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
      }
    >
      <LinkList items={linkItems} emptyMessage="No apps found" />
    </CardContainer>
  );
};
