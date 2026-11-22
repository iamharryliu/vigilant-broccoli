import { toApiServiceDocsHref, API_SERVICES } from './apiServices';
import { DOCKER_IMAGES } from './dockerImages';
import { NPM_PACKAGE_SLUGS } from './npmPackages';
import {
  API_SERVICES_ROUTE,
  CHANGELOG_ROUTE,
  DEPLOYMENTS_ROUTE,
  DOCKER_ROUTE,
  GAMES_ROUTE,
  GITHUB_ROUTE,
  HOME_ROUTE,
  NPM_ROUTE,
  PROJECT_GRAPH_ROUTE,
  REPO_TIMELINE_ROUTE,
  STATUS_ROUTE,
  WEB_APPLICATIONS_ROUTE,
  toWebApplicationRoute,
} from './routes';
import WEB_APPLICATIONS from './webApplications.json';

export type SearchEntry = {
  id: string;
  title: string;
  description?: string;
  href: string;
  route: boolean;
};

type Translate = (key: never) => string;

const PAGE_ENTRIES = [
  [HOME_ROUTE, 'HOME.PAGE_TITLE', 'HOME.TITLE'],
  [STATUS_ROUTE, 'HOME.STATUS.TITLE', 'HOME.STATUS.DESCRIPTION'],
  [DEPLOYMENTS_ROUTE, 'HOME.DEPLOYMENTS.TITLE', 'HOME.DEPLOYMENTS.DESCRIPTION'],
  [CHANGELOG_ROUTE, 'HOME.CHANGELOG.TITLE', 'HOME.CHANGELOG.DESCRIPTION'],
  [
    REPO_TIMELINE_ROUTE,
    'HOME.REPO_TIMELINE.TITLE',
    'HOME.REPO_TIMELINE.DESCRIPTION',
  ],
  [
    PROJECT_GRAPH_ROUTE,
    'HOME.PROJECT_GRAPH.TITLE',
    'HOME.PROJECT_GRAPH.DESCRIPTION',
  ],
  [GAMES_ROUTE, 'GAMES_PAGE.TITLE', 'GAMES_PAGE.DESCRIPTION'],
  [GITHUB_ROUTE, 'HOME.GITHUB.TITLE', 'HOME.GITHUB.DESCRIPTION'],
  [DOCKER_ROUTE, 'HOME.DOCKER_HUB.TITLE', 'HOME.DOCKER_HUB.DESCRIPTION'],
  [NPM_ROUTE, 'HOME.NPM.TITLE', 'HOME.NPM.DESCRIPTION'],
  [
    WEB_APPLICATIONS_ROUTE,
    'HOME.WEB_APPLICATIONS.TITLE',
    'HOME.WEB_APPLICATIONS.DESCRIPTION',
  ],
  [
    API_SERVICES_ROUTE,
    'HOME.API_SERVICES.TITLE',
    'HOME.API_SERVICES.DESCRIPTION',
  ],
] as const;

const toKeySegment = (slug: string) => slug.toUpperCase().replace(/-/g, '_');

// The API services page keys bucket-service as STORAGE_SERVICE.
const API_SERVICE_KEY_SEGMENTS: Record<string, string> = {
  'bucket-service': 'STORAGE_SERVICE',
};

export const buildSearchEntries = (t: Translate): SearchEntry[] => {
  const translate = (key: string) => t(key as never);
  const webApplications = [
    ...WEB_APPLICATIONS.applications,
    ...WEB_APPLICATIONS.demos,
    ...WEB_APPLICATIONS.private,
  ].filter(entry => !('game' in entry && entry.game));
  const games = WEB_APPLICATIONS.applications.filter(
    entry => 'game' in entry && entry.game,
  );

  return [
    ...PAGE_ENTRIES.map(([route, titleKey, descriptionKey]) => ({
      id: route,
      title: translate(titleKey),
      description: translate(descriptionKey),
      href: route,
      route: true,
    })),
    ...webApplications.map(({ id, titleKey, descriptionKey }) => ({
      id: toWebApplicationRoute(id),
      title: translate(titleKey),
      description: translate(descriptionKey),
      href: toWebApplicationRoute(id),
      route: true,
    })),
    ...games.map(({ id, href, titleKey, descriptionKey }) => ({
      id: `${GAMES_ROUTE}/${id}`,
      title: translate(titleKey),
      description: translate(descriptionKey),
      href,
      route: false,
    })),
    ...DOCKER_IMAGES.map(({ slug, descriptionKey }) => ({
      id: `${DOCKER_ROUTE}/${slug}`,
      title: slug,
      description: translate(descriptionKey),
      href: `${DOCKER_ROUTE}/${slug}`,
      route: true,
    })),
    ...NPM_PACKAGE_SLUGS.map(slug => ({
      id: `${NPM_ROUTE}/${slug}`,
      title: translate(`NPM_PACKAGES_PAGE.${toKeySegment(slug)}.TITLE`),
      description: translate(
        `NPM_PACKAGES_PAGE.${toKeySegment(slug)}.DESCRIPTION`,
      ),
      href: `${NPM_ROUTE}/${slug}`,
      route: true,
    })),
    ...API_SERVICES.map(({ slug }) => {
      const segment = API_SERVICE_KEY_SEGMENTS[slug] ?? toKeySegment(slug);
      return {
        id: `${API_SERVICES_ROUTE}/${slug}`,
        title: translate(`API_SERVICES_PAGE.${segment}.TITLE`),
        description: translate(`API_SERVICES_PAGE.${segment}.DESCRIPTION`),
        href: toApiServiceDocsHref(slug),
        route: true,
      };
    }),
  ];
};
