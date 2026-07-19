'use client';

import {
  ButtonList,
  ButtonConfig,
  CardContainer,
  StatusCardList,
  StatusCardListItem,
  WINDOW_OPEN_FEATURES,
} from '@vigilant-broccoli/react-lib';
import { VERCEL_LINK } from '@vigilant-broccoli/links';
import { useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';
import { usePollingInterval } from '../hooks/usePollingInterval';

interface VercelProject {
  id: string;
  name: string;
  url: string | null;
}

interface VercelProjectsResponse {
  success: boolean;
  projects?: VercelProject[];
  org?: string | null;
  error?: string;
}

const TITLE = 'Vercel Apps';
const VERCEL_BASE = 'https://vercel.com';
const POLL_INTERVAL_MS = 60000;
const FETCH_ERROR_MSG = 'Failed to fetch Vercel projects';

const HEADER_LINK_CLASS =
  'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm';

const OrgLinks = () => (
  <a
    href={VERCEL_LINK.DASHBOARD.URL}
    target="_blank"
    rel="noopener noreferrer"
    className={HEADER_LINK_CLASS}
  >
    Dashboard →
  </a>
);

const projectBase = (org: string, name: string) =>
  `${VERCEL_BASE}/${org}/${name}`;

const getProjectButtons = (
  org: string,
  project: VercelProject,
): ButtonConfig[] => {
  const open = (url: string) =>
    window.open(url, '_blank', WINDOW_OPEN_FEATURES);
  const base = projectBase(org, project.name);
  const buttons: ButtonConfig[] = [
    {
      label: 'Deployments',
      onClick: () => open(base),
      isExternal: true,
    },
    {
      label: 'Env Vars',
      onClick: () => open(`${base}/settings/environment-variables`),
      isExternal: true,
    },
    {
      label: 'Logs',
      onClick: () => open(`${base}/logs`),
      isExternal: true,
    },
    {
      label: 'Settings',
      onClick: () => open(`${base}/settings`),
      isExternal: true,
    },
  ];
  if (project.url) {
    buttons.unshift({
      label: 'App',
      onClick: () => open(project.url!),
      isExternal: true,
    });
  }
  return buttons;
};

const toItem = (org: string, project: VercelProject): StatusCardListItem => ({
  id: project.id,
  label: project.name,
  children: <ButtonList buttons={getProjectButtons(org, project)} />,
});

export const VercelAppsComponent = () => {
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [org, setOrg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.VERCEL_PROJECTS);
      const data: VercelProjectsResponse = await response.json();
      if (!data.success || !data.projects) {
        setError(data.error || FETCH_ERROR_MSG);
        setLoading(false);
        return;
      }
      setError(null);
      setProjects(data.projects);
      setOrg(data.org ?? null);
      setLoading(false);
    } catch {
      setError(FETCH_ERROR_MSG);
      setLoading(false);
    }
  };

  usePollingInterval(fetchProjects, POLL_INTERVAL_MS);

  if (loading) return <CardSkeleton title={TITLE} rows={5} />;

  if (error) {
    return (
      <CardContainer title={TITLE} gap="3" headerAction={<OrgLinks />}>
        <p className="text-sm text-red-500">{error}</p>
      </CardContainer>
    );
  }

  return (
    <CardContainer title={TITLE} gap="3" headerAction={<OrgLinks />}>
      <StatusCardList
        items={projects.map(p => toItem(org ?? '', p))}
        emptyMessage="No projects found"
      />
    </CardContainer>
  );
};
