import { PROJECT_LINK } from '@harry/personal';

export const STATUS_HOST = 'status.harryliu.dev';

export const DEPLOYMENTS_HOST = 'deployments.harryliu.dev';

export const CAREER_HOST = 'career.harryliu.dev';

export const PROJECTS_URL = PROJECT_LINK.SOFTWARE_PROJECTS.URL;

export const isStatusHost = (hostname: string = window.location.hostname) =>
  hostname === STATUS_HOST;

export const isCareerHost = (hostname: string = window.location.hostname) =>
  hostname === CAREER_HOST;

export const isDeploymentsHost = (
  hostname: string = window.location.hostname,
) => hostname === DEPLOYMENTS_HOST;

export const toProjectsUrl = (route: string) => `${PROJECTS_URL}#${route}`;
