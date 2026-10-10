import { PROJECT_LINK } from '@vigilant-broccoli/personal-common-js';

export const STATUS_HOST = 'status.harryliu.dev';

export const PROJECTS_URL = PROJECT_LINK.SOFTWARE_PROJECTS.URL;

export const isStatusHost = (hostname: string = window.location.hostname) =>
  hostname === STATUS_HOST;

export const toProjectsUrl = (route: string) => `${PROJECTS_URL}#${route}`;
