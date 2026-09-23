import {
  COMMUNITY_LINK,
  EMAIL_LINK,
  SOCIAL_LINK,
} from '@vigilant-broccoli/personal-common-js';
import { ENVIRONMENT } from '../../../environments/environment';

export const DEFAULT_DESCRIPTION =
  'Harry Liu - Software developer, designer, and creator. Explore my portfolio and projects.';

export type Link = {
  url: {
    internal?: string;
    external?: string;
  };
  text: string;
};

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
};

export const INDEX_ROUTE: RouteMeta = {
  path: '/',
  title: 'home',
  description: DEFAULT_DESCRIPTION,
};

export const ABOUT_ROUTE: RouteMeta = {
  path: '/about',
  title: 'about',
  description: 'Learn more about Harry Liu - developer, designer, and creator.',
};

export const CONTACT_ROUTE: RouteMeta = {
  path: '/contact',
  title: 'contact',
  description: 'Get in touch with Harry Liu.',
};

export const LINK_TREE_ROUTE: RouteMeta = {
  path: '/links',
  title: 'link tree',
  description: "Harry Liu's links - social media, projects, and more.",
};

export const CALENDAR_ROUTE: RouteMeta = {
  path: '/calendar',
  title: 'calendar',
  description: "Harry Liu's calendar.",
};

const internalUrl = (path: string) =>
  path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`;

const externalUrl = (path: string) =>
  path === '/'
    ? ENVIRONMENT.APP_URL
    : `${ENVIRONMENT.APP_URL}${internalUrl(path)}`;

const INDEX_PAGE: Link = {
  url: { internal: '/', external: ENVIRONMENT.APP_URL },
  text: 'Home',
};
const ABOUT_PAGE: Link = {
  url: { internal: ABOUT_ROUTE.path, external: externalUrl(ABOUT_ROUTE.path) },
  text: 'About',
};
const CONTACT_PAGE: Link = {
  url: {
    internal: CONTACT_ROUTE.path,
    external: externalUrl(CONTACT_ROUTE.path),
  },
  text: 'Contact',
};
const CALENDAR_PAGE: Link = {
  url: {
    internal: CALENDAR_ROUTE.path,
    external: externalUrl(CALENDAR_ROUTE.path),
  },
  text: 'Calendar',
};
const LINK_TREE: Link = {
  url: {
    internal: LINK_TREE_ROUTE.path,
    external: externalUrl(LINK_TREE_ROUTE.path),
  },
  text: 'Links',
};
const EMAIL: Link = {
  url: { external: EMAIL_LINK.URL },
  text: EMAIL_LINK.NAME,
};
const LINKEDIN: Link = {
  url: { external: SOCIAL_LINK.LINKEDIN.URL },
  text: 'LinkedIn',
};
const GITHUB: Link = {
  url: { external: SOCIAL_LINK.GITHUB.URL },
  text: 'Github',
};
const PERSONAL_INSTAGRAM: Link = {
  url: { external: SOCIAL_LINK.INSTAGRAM_PRETTYDAMNTIRED.URL },
  text: 'Personal Instagram',
};
const SECONDHAND_STORE_IG: Link = {
  url: { external: SOCIAL_LINK.INSTAGRAM_HARRYSELLSSHIT.URL },
  text: 'Secondhand Store harrysellsshit',
};
const SKATE_IG: Link = {
  url: { external: SOCIAL_LINK.INSTAGRAM_TORONTOCITYSKATE.URL },
  text: 'Toronto City Skate',
};
const CLOUD8SKATE: Link = {
  url: { external: COMMUNITY_LINK.CLOUD8SKATE.URL },
  text: 'Cloud 8 Skate',
};
const CLOUD8SKATE_IG: Link = {
  url: { external: SOCIAL_LINK.INSTAGRAM_CLOUD8SKATE.URL },
  text: 'Cloud 8 Skate Instagram',
};
const RESUME_PATH = '/resume';
const RESUME: Link = {
  url: { external: externalUrl(RESUME_PATH) },
  text: 'Resume',
};

export const LINKS = {
  INDEX_PAGE,
  ABOUT_PAGE,
  CALENDAR_PAGE,
  CONTACT_PAGE,
  LINK_TREE,
  EMAIL,
  LINKEDIN,
  GITHUB,
  PERSONAL_INSTAGRAM,
  SECONDHAND_STORE_IG,
  SKATE_IG,
  CLOUD8SKATE,
  CLOUD8SKATE_IG,
  RESUME,
};

export const ROUTES: RouteMeta[] = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  LINK_TREE_ROUTE,
  CALENDAR_ROUTE,
];
