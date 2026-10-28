'use client';

import {
  Badge,
  ButtonList,
  StatusCardListItem,
  WINDOW_OPEN_FEATURES,
} from '@vigilant-broccoli/react-lib';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  RENDER_DASHBOARD_URL,
  RENDER_SUSPENDED,
  RenderService,
  RenderServicesResponse,
} from '../constants/render';
import { usePolledResource } from '../hooks/usePolledResource';
import { useTranslation } from '../i18n';
import { StatusListCard } from './status-list-card.component';
import { StatusDot } from './status-dot.component';

const POLL_INTERVAL_MS = 60000;

export const RenderServicesComponent = () => {
  const { t } = useTranslation();
  const errorMessage = t('RENDER.FETCH_ERROR');
  const { data, loading, error } = usePolledResource<RenderService[]>({
    endpoint: API_ENDPOINTS.RENDER_SERVICES,
    intervalMs: POLL_INTERVAL_MS,
    errorMessage,
    select: (json: RenderServicesResponse) => {
      if (!json.success || !json.services) throw new Error(errorMessage);
      return json.services;
    },
  });

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
      items={(data ?? []).map(toItem)}
      emptyMessage={t('RENDER.EMPTY')}
    />
  );
};
