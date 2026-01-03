'use client';

import { Flex, Text, Badge, Link } from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
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
      {appsData.length === 0 ? (
          <Text size="2" color="gray">
            No apps found
          </Text>
        ) : (
          <Flex direction="column" gap="2">
            {appsData.map(app => (
              <Flex
                key={app.name}
                direction="column"
                gap="1"
                style={{
                  backgroundColor: 'var(--gray-2)',
                  borderRadius: '6px',
                }}
              >
                <Flex justify="between" align="center">
                  <Link
                    href={`https://fly.io/apps/${app.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="3"
                    weight="bold"
                  >
                    <Flex align="center" gap="1">
                      {app.name}
                      <ExternalLinkIcon width="12" height="12" />
                    </Flex>
                  </Link>
                  <Badge color={getStatusColor(app.status)} size="1">
                    {app.status}
                  </Badge>
                </Flex>
              </Flex>
            ))}
          </Flex>
        )}
    </CardContainer>
  );
};
