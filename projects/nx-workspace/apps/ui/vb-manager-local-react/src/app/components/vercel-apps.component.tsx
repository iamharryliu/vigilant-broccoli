import {
  ButtonList,
  ButtonConfig,
  StatusCardListItem,
  WINDOW_OPEN_FEATURES,
} from '@vigilant-broccoli/react-lib';
import { VERCEL_LINK } from '@vigilant-broccoli/public-links';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { StatusListCard } from './status-list-card.component';
import { usePolledResource } from '../hooks/usePolledResource';

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
  const { data, loading, error } = usePolledResource<VercelProjectsResponse>({
    endpoint: API_ENDPOINTS.VERCEL_PROJECTS,
    intervalMs: POLL_INTERVAL_MS,
    errorMessage: FETCH_ERROR_MSG,
    select: (json: VercelProjectsResponse) => {
      if (!json.success || !json.projects)
        throw new Error(json.error || FETCH_ERROR_MSG);
      return json;
    },
  });

  return (
    <StatusListCard
      title={TITLE}
      gap="3"
      loading={loading}
      error={error}
      skeletonRows={5}
      headerAction={<OrgLinks />}
      items={(data?.projects ?? []).map(p => toItem(data?.org ?? '', p))}
      emptyMessage="No projects found"
    />
  );
};
