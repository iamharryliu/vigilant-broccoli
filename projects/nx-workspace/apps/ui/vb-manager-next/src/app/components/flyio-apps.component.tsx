'use client';

import {
  Badge,
  Button,
  ButtonConfig,
  ButtonList,
  CardContainer,
  StatusCardList,
  StatusCardListItem,
  Text,
  WINDOW_OPEN_FEATURES,
  CardSkeleton,
} from '@vigilant-broccoli/react-lib';
import { FLYIO_LINK } from '@vigilant-broccoli/links';
import { useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';
import { usePollingInterval } from '../hooks/usePollingInterval';

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

interface FlyLoginResponse {
  success: boolean;
  error?: string;
  authUrl?: string | null;
}

const FETCH_ERROR_MSG = 'Failed to fetch Fly.io apps';
const LOGIN_ERROR_MSG = 'Fly.io login failed';
const LOGIN_PENDING_MSG =
  'Finish the sign-in in the browser tab that just opened.';
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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  const fetchFlyApps = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.FLYIO_APPS);
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
  };

  usePollingInterval(fetchFlyApps, POLL_INTERVAL_MS);

  const handleLogin = async () => {
    setLoggingIn(true);
    setLoginError(null);
    setAuthUrl(null);
    try {
      const response = await authFetch(API_ENDPOINTS.FLYIO_AUTH_LOGIN, {
        method: 'POST',
      });
      const data: FlyLoginResponse = await response.json();
      if (!data.success) {
        setLoginError(data.error || LOGIN_ERROR_MSG);
        setAuthUrl(data.authUrl ?? null);
        return;
      }
    } catch {
      setLoginError(LOGIN_ERROR_MSG);
      return;
    } finally {
      setLoggingIn(false);
    }
    setLoading(true);
    await fetchFlyApps();
  };

  if (loading) return <CardSkeleton title="Fly.io Apps" rows={5} />;

  if (error) {
    return (
      <CardContainer title="Fly.io Apps" gap="3" headerLink={DASHBOARD_LINK}>
        {authRequired ? (
          <div className="flex flex-col gap-2 items-start">
            <Text size="2">Not logged in to Fly.io.</Text>
            <Button
              variant="secondary"
              loading={loggingIn}
              onClick={handleLogin}
            >
              Login to Fly.io
            </Button>
            {loggingIn && (
              <Text size="1" color="gray">
                {LOGIN_PENDING_MSG}
              </Text>
            )}
            {loginError && (
              <Text size="1" color="red">
                {loginError}
              </Text>
            )}
            {authUrl && (
              <Button
                variant="secondary"
                onClick={() =>
                  window.open(authUrl, '_blank', WINDOW_OPEN_FEATURES)
                }
              >
                Open sign-in page
              </Button>
            )}
          </div>
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
