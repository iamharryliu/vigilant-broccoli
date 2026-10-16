'use client';

import {
  Badge,
  ButtonList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { StatusListCard } from './status-list-card.component';
import { usePolledResource } from '../hooks/usePolledResource';

const TITLE = 'GitHub Pages';
const GH_BASE = 'https://github.com';
const GH_SETTINGS_PAGES_URL = `${GH_BASE}/settings/pages`;
const POLL_INTERVAL_MS = 60000;
const TARGET_BLANK = '_blank';

const STATUS = {
  BUILT: 'built',
  BUILDING: 'building',
  ERRORED: 'errored',
} as const;

const STATUS_COLOR: Record<string, 'green' | 'orange' | 'red'> = {
  [STATUS.BUILT]: 'green',
  [STATUS.BUILDING]: 'orange',
  [STATUS.ERRORED]: 'red',
};

const LABEL = {
  SETTINGS: 'Settings',
  SITE: 'Site',
  REPO: 'Repo',
  PAGES_SETTINGS: 'Pages Settings',
  UNKNOWN_STATUS: 'unknown',
};

const MESSAGE = {
  FETCH_FAILED: 'Failed to fetch GitHub Pages sites',
  FETCH_FAILED_SHORT: 'Failed to fetch GitHub Pages',
  FETCH_ERROR_LOG: 'GitHub Pages fetch error:',
  EMPTY: 'No GitHub Pages sites found',
};

interface GithubPagesSite {
  fullName: string;
  repoUrl: string;
  pagesUrl: string;
  status: string | null;
  cname: string | null;
}

interface GithubPagesResponse {
  success: boolean;
  sites?: GithubPagesSite[];
  error?: string;
}

const repoSettingsPagesUrl = (repoUrl: string) => `${repoUrl}/settings/pages`;

const openExternal = (url: string) => window.open(url, TARGET_BLANK);

const SETTINGS_LINK = {
  href: GH_SETTINGS_PAGES_URL,
  label: LABEL.SETTINGS,
};

const toItem = (site: GithubPagesSite): StatusCardListItem => ({
  id: site.fullName,
  label: site.fullName,
  badges: (
    <div className="flex gap-1">
      <Badge color={STATUS_COLOR[site.status ?? ''] ?? 'gray'} size="1">
        {site.status ?? LABEL.UNKNOWN_STATUS}
      </Badge>
      {site.cname && (
        <Badge color="blue" size="1">
          {site.cname}
        </Badge>
      )}
    </div>
  ),
  children: (
    <div className="flex flex-col gap-2">
      <ButtonList
        buttons={[
          {
            label: LABEL.SITE,
            onClick: () => openExternal(site.pagesUrl),
            isExternal: true,
          },
          {
            label: LABEL.REPO,
            onClick: () => openExternal(site.repoUrl),
            isExternal: true,
          },
          {
            label: LABEL.PAGES_SETTINGS,
            onClick: () => openExternal(repoSettingsPagesUrl(site.repoUrl)),
            isExternal: true,
          },
        ]}
      />
    </div>
  ),
});

export const GithubPagesComponent = () => {
  const { data, loading, error } = usePolledResource<GithubPagesSite[]>({
    endpoint: API_ENDPOINTS.GITHUB_PAGES,
    intervalMs: POLL_INTERVAL_MS,
    errorMessage: MESSAGE.FETCH_FAILED_SHORT,
    select: (json: GithubPagesResponse) => {
      if (!json.success || !json.sites)
        throw new Error(json.error || MESSAGE.FETCH_FAILED);
      return json.sites;
    },
  });

  return (
    <StatusListCard
      title={TITLE}
      gap="3"
      loading={loading}
      error={error}
      headerLink={SETTINGS_LINK}
      items={(data ?? []).map(toItem)}
      emptyMessage={MESSAGE.EMPTY}
    />
  );
};
