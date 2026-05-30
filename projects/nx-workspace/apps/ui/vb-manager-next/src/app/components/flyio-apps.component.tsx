'use client';

import { Badge, Button, Flex, Text } from '@radix-ui/themes';
import {
  ButtonList,
  ButtonConfig,
  StatusCardList,
  StatusCardListItem,
  WINDOW_OPEN_FEATURES,
} from '@vigilant-broccoli/react-lib';
import { FLYIO_LINK } from '@vigilant-broccoli/links';
import { useCallback, useEffect, useState } from 'react';
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
  authRequired?: boolean;
}

const FETCH_ERROR_MSG = 'Failed to fetch Fly.io apps';
const FLY_BASE = 'https://fly.io/apps';
const POLL_INTERVAL_MS = 60000;

const getStatusColor = (
  status: string,
): 'green' | 'yellow' | 'red' | 'gray' => {
  const s = status.toLowerCase();
  if (s === 'deployed' || s === 'running') return 'green';
  if (s === 'suspended') return 'yellow';
  if (s === 'pending') return 'gray';
  return 'red';
};

const DASHBOARD_LINK = {
  href: FLYIO_LINK.DASHBOARD.URL,
  label: 'Dashboard',
};

const getAppUrls = (appName: string) => ({
  App: `${FLY_BASE}/${appName}`,
  Secrets: `${FLY_BASE}/${appName}/secrets`,
  Monitoring: `${FLY_BASE}/${appName}/monitoring`,
});

const toItem = (app: FlyApp): StatusCardListItem => ({
  id: app.name,
  label: app.name,
  badges: (
    <Badge color={getStatusColor(app.status)} size="1">
      {app.status}
    </Badge>
  ),
  children: (
    <ButtonList
      buttons={Object.entries(getAppUrls(app.name)).map(
        ([label, url]): ButtonConfig => ({
          label,
          onClick: () => window.open(url, '_blank', WINDOW_OPEN_FEATURES),
          isExternal: true,
        }),
      )}
    />
  ),
});

export const FlyIoAppsComponent = () => {
  const [appsData, setAppsData] = useState<FlyApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const fetchFlyApps = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.FLYIO_APPS);
      const data: FlyAppsResponse = await response.json();
      if (!data.success || !data.apps) {
        setAuthRequired(!!data.authRequired);
        setError(data.error || FETCH_ERROR_MSG);
        setLoading(false);
        return;
      }
      setAuthRequired(false);
      setError(null);
      setAppsData(data.apps);
      setLoading(false);
    } catch {
      setError(FETCH_ERROR_MSG);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlyApps();
    const interval = setInterval(fetchFlyApps, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchFlyApps]);

  const handleLogin = async () => {
    setLoggingIn(true);
    await fetch(API_ENDPOINTS.FLYIO_AUTH_LOGIN, { method: 'POST' });
    setLoggingIn(false);
    setLoading(true);
    await fetchFlyApps();
  };

  if (loading) return <CardSkeleton title="Fly.io Apps" rows={5} />;

  if (error) {
    return (
      <CardContainer title="Fly.io Apps" gap="3" headerLink={DASHBOARD_LINK}>
        {authRequired ? (
          <Flex direction="column" gap="2" align="start">
            <Text size="2">Not logged in to Fly.io.</Text>
            <Button
              size="2"
              variant="soft"
              color="blue"
              loading={loggingIn}
              onClick={handleLogin}
            >
              Login to Fly.io
            </Button>
          </Flex>
        ) : (
          <Badge color="red">{error}</Badge>
        )}
      </CardContainer>
    );
  }

  return (
    <CardContainer title="Fly.io Apps" gap="3" headerLink={DASHBOARD_LINK}>
      <StatusCardList
        items={appsData.map(toItem)}
        emptyMessage="No apps found"
      />
    </CardContainer>
  );
};
