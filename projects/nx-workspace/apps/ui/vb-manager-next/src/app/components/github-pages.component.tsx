'use client';

import { Badge, Flex, Text } from '@radix-ui/themes';
import {
  ButtonList,
  StatusCardList,
  StatusCardListItem,
} from '@vigilant-broccoli/react-lib';
import { useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { CardContainer } from './card-container.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

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
    <Flex gap="1">
      <Badge color={STATUS_COLOR[site.status ?? ''] ?? 'gray'} size="1">
        {site.status ?? LABEL.UNKNOWN_STATUS}
      </Badge>
      {site.cname && (
        <Badge color="blue" size="1">
          {site.cname}
        </Badge>
      )}
    </Flex>
  ),
  children: (
    <Flex direction="column" gap="2">
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
    </Flex>
  ),
});

export const GithubPagesComponent = () => {
  const [sites, setSites] = useState<GithubPagesSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GITHUB_PAGES);
      const data: GithubPagesResponse = await response.json();
      if (!data.success || !data.sites)
        throw new Error(data.error || MESSAGE.FETCH_FAILED);
      setSites(data.sites);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : MESSAGE.FETCH_FAILED_SHORT);
      setLoading(false);
      console.error(MESSAGE.FETCH_ERROR_LOG, err);
    }
  };

  useEffect(() => {
    fetchSites();
    const interval = setInterval(fetchSites, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <CardSkeleton title={TITLE} rows={3} />;

  if (error) {
    return (
      <CardContainer title={TITLE} gap="3" headerLink={SETTINGS_LINK}>
        <Text size="2" color="red">
          {error}
        </Text>
      </CardContainer>
    );
  }

  return (
    <CardContainer title={TITLE} gap="3" headerLink={SETTINGS_LINK}>
      <StatusCardList items={sites.map(toItem)} emptyMessage={MESSAGE.EMPTY} />
    </CardContainer>
  );
};
