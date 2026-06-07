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
import { useCallback, useEffect, useState } from 'react';
import { CardSkeleton } from './skeleton.component';
import { API_ENDPOINTS } from '../constants/api-endpoints';

interface VercelProject {
  id: string;
  name: string;
  url: string | null;
}

interface VercelProjectsResponse {
  success: boolean;
  projects?: VercelProject[];
  error?: string;
}

const TITLE = 'Vercel Apps';
const VERCEL_DASH = 'https://vercel.com';
const POLL_INTERVAL_MS = 60000;
const FETCH_ERROR_MSG = 'Failed to fetch Vercel projects';

const DASHBOARD_LINK = {
  href: VERCEL_LINK.DASHBOARD.URL,
  label: 'Dashboard',
};

const getProjectButtons = (project: VercelProject): ButtonConfig[] => {
  const open = (url: string) =>
    window.open(url, '_blank', WINDOW_OPEN_FEATURES);
  const buttons: ButtonConfig[] = [
    {
      label: 'Deployments',
      onClick: () => open(`${VERCEL_DASH}/${project.name}`),
      isExternal: true,
    },
    {
      label: 'Settings',
      onClick: () => open(`${VERCEL_DASH}/${project.name}/settings`),
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

const toItem = (project: VercelProject): StatusCardListItem => ({
  id: project.id,
  label: project.name,
  children: <ButtonList buttons={getProjectButtons(project)} />,
});

export const VercelAppsComponent = () => {
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.VERCEL_PROJECTS);
      const data: VercelProjectsResponse = await response.json();
      if (!data.success || !data.projects) {
        setError(data.error || FETCH_ERROR_MSG);
        setLoading(false);
        return;
      }
      setError(null);
      setProjects(data.projects);
      setLoading(false);
    } catch {
      setError(FETCH_ERROR_MSG);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchProjects]);

  if (loading) return <CardSkeleton title={TITLE} rows={5} />;

  if (error) {
    return (
      <CardContainer title={TITLE} gap="3" headerLink={DASHBOARD_LINK}>
        <p className="text-sm text-red-500">{error}</p>
      </CardContainer>
    );
  }

  return (
    <CardContainer title={TITLE} gap="3" headerLink={DASHBOARD_LINK}>
      <StatusCardList
        items={projects.map(toItem)}
        emptyMessage="No projects found"
      />
    </CardContainer>
  );
};
