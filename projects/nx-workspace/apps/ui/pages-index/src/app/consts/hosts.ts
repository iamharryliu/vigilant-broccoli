import { PROJECT_LINK } from '@harry/personal';

export const STATUS_HOST = 'status.vigilant-broccoli.app';

export const DEPLOYMENTS_HOST = 'deployments.vigilant-broccoli.app';

export const CAREER_HOST = 'career.harryliu.dev';

export const PROJECTS_URL = PROJECT_LINK.SOFTWARE_PROJECTS.URL;

export const isStatusHost = (hostname: string = window.location.hostname) =>
  hostname === STATUS_HOST;

export const isCareerHost = (hostname: string = window.location.hostname) =>
  hostname === CAREER_HOST;

export const isDeploymentsHost = (
  hostname: string = window.location.hostname,
) => hostname === DEPLOYMENTS_HOST;

export const toProjectsUrl = (route: string) =>
  new URL(route.replace(/^\//, ''), PROJECTS_URL).href;

export const GAMES_HOST = 'games.vigilant-broccoli.app';
export const isGamesHost = (hostname: string = window.location.hostname) =>
  hostname === GAMES_HOST;
