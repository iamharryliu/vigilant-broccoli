import { ENVIRONMENT } from '../../../environments/environment';
import { URLS } from './urls.const';

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

export const CAREER_ROUTE: RouteMeta = {
  path: '/career',
  title: 'career',
  description: "Harry Liu's career experience and work history.",
};

export const DOCS_MD_ROUTE: RouteMeta = {
  path: '/docs-md',
  title: 'DocsMD',
  description: 'Browse markdown documents and notes by Harry Liu.',
};

export const DOCS_MD_FILE_ROUTE: RouteMeta = {
  path: '/docs-md/:markdownFilename',
  title: 'DocsMD',
  description: 'Browse markdown documents and notes by Harry Liu.',
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

export const COMPONENT_LIBRARY_ROUTE: RouteMeta = {
  path: '/component-library',
  title: 'component library',
  description: 'A showcase of reusable UI components by Harry Liu.',
};

export const CALENDAR_ROUTE: RouteMeta = {
  path: '/calendar',
  title: 'calendar',
  description: "Harry Liu's calendar.",
};

export const LEETCODE_ROUTE: RouteMeta = {
  path: '/grind-75',
  title: 'grind 75',
  description: 'Grind 75 LeetCode solutions by Harry Liu.',
};

export const LEETCODE_SOLUTION_ROUTE: RouteMeta = {
  path: '/grind-75/:language/:filename',
  title: 'grind75',
  description: 'Grind 75 LeetCode solutions by Harry Liu.',
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
const LINKEDIN: Link = { url: { external: URLS.LINKEDIN }, text: 'LinkedIn' };
const KOFI: Link = {
  url: { external: URLS.KOFI },
  text: 'Buy me a coffee? 🥺',
};
const GITHUB: Link = { url: { external: URLS.GITHUB }, text: 'Github' };
const PERSONAL_INSTAGRAM: Link = {
  url: { external: URLS.PERSONAL_IG },
  text: 'Personal Instagram',
};
const SECONDHAND_STORE_IG: Link = {
  url: { external: URLS.SECONDHAND_STORE_IG },
  text: 'Secondhand Store harrysellsshit',
};
const SKATE_IG: Link = {
  url: { external: URLS.SKATE_IG },
  text: 'Toronto City Skate',
};
const CLOUD8SKATE: Link = {
  url: { external: URLS.CLOUD8SKATE },
  text: 'Cloud 8 Skate',
};
const CLOUD8SKATE_IG: Link = {
  url: { external: URLS.CLOUD8SKATE_IG },
  text: 'Cloud 8 Skate Instagram',
};
const RESUME: Link = {
  url: { external: `${ENVIRONMENT.APP_URL}/assets/resume.pdf` },
  text: 'Resume',
};
const DOCS_MD: Link = {
  url: {
    internal: DOCS_MD_ROUTE.path,
    external: externalUrl(DOCS_MD_ROUTE.path),
  },
  text: 'DocsMD',
};

export const LINKS = {
  INDEX_PAGE,
  ABOUT_PAGE,
  CALENDAR_PAGE,
  CONTACT_PAGE,
  LINK_TREE,
  DOCS_MD,
  LINKEDIN,
  GITHUB,
  PERSONAL_INSTAGRAM,
  SECONDHAND_STORE_IG,
  SKATE_IG,
  CLOUD8SKATE,
  CLOUD8SKATE_IG,
  RESUME,
  KOFI,
};

export const ROUTES: RouteMeta[] = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CAREER_ROUTE,
  CONTACT_ROUTE,
  DOCS_MD_ROUTE,
  DOCS_MD_FILE_ROUTE,
  LINK_TREE_ROUTE,
  CALENDAR_ROUTE,
  COMPONENT_LIBRARY_ROUTE,
  LEETCODE_ROUTE,
  LEETCODE_SOLUTION_ROUTE,
];
