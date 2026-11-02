'use client';

import {
  Badge,
  Button,
  ButtonList,
  StatusCardListItem,
  Text,
  WINDOW_OPEN_FEATURES,
} from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  RENDER_DASHBOARD_URL,
  RENDER_SUSPENDED,
  RenderService,
  RenderServicesResponse,
} from '../constants/render';
import { authFetch } from '../../../libs/auth';
import { usePollingInterval } from '../hooks/usePollingInterval';
import { useTranslation } from '../i18n';
import { StatusListCard } from './status-list-card.component';
import { StatusDot } from './status-dot.component';

const POLL_INTERVAL_MS = 60000;
const FETCH_ERROR_MSG = 'Unable to load Render services';

interface RenderLoginResponse {
  success: boolean;
  error?: string;
  authUrl?: string | null;
}

export const RenderServicesComponent = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<RenderService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.RENDER_SERVICES);
      const json: RenderServicesResponse = await response.json();
      if (!response.ok || !json.success || !json.services) {
        setAuthRequired(!!json.authRequired);
        setError(FETCH_ERROR_MSG);
        return;
      }
      setAuthRequired(false);
      setError(null);
      setData(json.services);
    } catch {
      setError(FETCH_ERROR_MSG);
    } finally {
      setLoading(false);
    }
  };

  usePollingInterval(fetchServices, POLL_INTERVAL_MS);

  const handleLogin = async () => {
    setLoggingIn(true);
    setLoginError(null);
    setAuthUrl(null);
    try {
      const response = await authFetch(API_ENDPOINTS.RENDER_AUTH_LOGIN, {
        method: 'POST',
      });
      const result: RenderLoginResponse = await response.json();
      if (!result.success) {
        setLoginError(result.error || t('RENDER.LOGIN_ERROR'));
        setAuthUrl(result.authUrl ?? null);
        return;
      }
    } catch {
      setLoginError(t('RENDER.LOGIN_ERROR'));
      return;
    } finally {
      setLoggingIn(false);
    }
    setLoading(true);
    await fetchServices();
  };

  const toItem = (service: RenderService): StatusCardListItem => ({
    id: service.id,
    label: service.name,
    badges: (
      <StatusDot
        color={service.suspended === RENDER_SUSPENDED ? 'yellow' : 'gray'}
        title={t(
          service.suspended === RENDER_SUSPENDED
            ? 'RENDER.SUSPENDED'
            : 'RENDER.NOT_SUSPENDED',
        )}
      />
    ),
    children: (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge color="gray">{service.type.replaceAll('_', ' ')}</Badge>
          <Badge
            color={service.suspended === RENDER_SUSPENDED ? 'orange' : 'gray'}
          >
            {t(
              service.suspended === RENDER_SUSPENDED
                ? 'RENDER.SUSPENDED'
                : 'RENDER.NOT_SUSPENDED',
            )}
          </Badge>
        </div>
        <ButtonList
          buttons={[
            { label: t('RENDER.SERVICE'), url: service.dashboardUrl },
            ...(service.url
              ? [{ label: t('RENDER.APP'), url: service.url }]
              : []),
          ].map(({ label, url }) => ({
            label,
            onClick: () => window.open(url, '_blank', WINDOW_OPEN_FEATURES),
            isExternal: true,
          }))}
        />
      </div>
    ),
  });

  return (
    <StatusListCard
      title={t('RENDER.TITLE')}
      gap="3"
      loading={loading}
      error={error}
      headerLink={{ href: RENDER_DASHBOARD_URL, label: t('RENDER.DASHBOARD') }}
      items={data.map(toItem)}
      emptyMessage={t('RENDER.EMPTY')}
      errorContent={
        authRequired ? (
          <div className="flex flex-col gap-2 items-start">
            <Text size="2">{t('RENDER.NOT_LOGGED_IN')}</Text>
            <Button variant="secondary" loading={loggingIn} onClick={handleLogin}>
              {t('RENDER.LOGIN')}
            </Button>
            {loggingIn && (
              <Text size="1" color="gray">
                {t('RENDER.LOGIN_PENDING')}
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
                onClick={() => window.open(authUrl, '_blank', WINDOW_OPEN_FEATURES)}
              >
                {t('RENDER.OPEN_SIGN_IN')}
              </Button>
            )}
          </div>
        ) : (
          <Badge color="red">{error}</Badge>
        )
      }
    />
  );
};
