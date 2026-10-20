import { toUpptimeSummaryUrl } from '@vigilant-broccoli/react-lib';
import { DOCKER_IMAGES } from './dockerImages';
import { toProjectsUrl } from './hosts';
import { toWebApplicationRoute } from './routes';
import WEB_APPLICATIONS from './webApplications.json';

const DOCKER_IMAGES_ROUTE = '/open-source/docker';

export const REPO_OWNER = 'iamharryliu';
export const REPO_NAME = 'vigilant-broccoli';
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
export const UPTIME_REPO_NAME = 'uptime';
export const UPTIME_REPO_URL = `https://github.com/${REPO_OWNER}/${UPTIME_REPO_NAME}`;

export const UPTIME_SITE_URL = 'https://uptime.harryliu.dev';

export const UPTIME_SUMMARY_URL = toUpptimeSummaryUrl(
  REPO_OWNER,
  UPTIME_REPO_NAME,
);

export const toRawGithubUrl = (path: string) =>
  `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${path}`;

// Links to a README that pages-index itself serves stay on the site; the absolute URL keeps
// them valid on the status/career hosts, where a bare hash link would not reach this app.
const SERVED_README_ROUTES = new Map<string, string>([
  ...DOCKER_IMAGES.map(
    ({ readmePath, slug }) =>
      [readmePath, `${DOCKER_IMAGES_ROUTE}/${slug}`] as const,
  ),
  ...[...WEB_APPLICATIONS.applications, ...WEB_APPLICATIONS.demos].map(
    ({ readmePath, id }) => [readmePath, toWebApplicationRoute(id)] as const,
  ),
]);

const resolveInternalHref = (path: string) => {
  const route = SERVED_README_ROUTES.get(path);
  return route ? toProjectsUrl(route) : null;
};

export const toRepoLinkBase = (filePath: string) => ({
  filePath,
  blobBase: `${REPO_URL}/blob/main`,
  rawBase: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main`,
  resolveInternalHref,
});
