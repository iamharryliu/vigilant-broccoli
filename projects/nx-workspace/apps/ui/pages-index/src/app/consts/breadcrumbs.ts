import { DotPaths } from '@vigilant-broccoli/react-lib';
import en from '../i18n/en.json';

type TranslationKey = DotPaths<typeof en>;

interface BreadcrumbNode {
  labelKey: TranslationKey;
  parent: string | null;
}

export interface BreadcrumbEntry {
  path: string;
  labelKey: TranslationKey;
}

const BREADCRUMB_TREE: Record<string, BreadcrumbNode> = {
  '/': { labelKey: 'HOME.TITLE', parent: null },
  '/status': { labelKey: 'STATUS_PAGE.TITLE', parent: '/' },
  '/open-source': { labelKey: 'OPEN_SOURCE_PAGE.TITLE', parent: '/' },
  '/open-source/github': {
    labelKey: 'OPEN_SOURCE_PAGE.GITHUB.TITLE',
    parent: '/open-source',
  },
  '/open-source/docker': {
    labelKey: 'DOCKER_IMAGES_PAGE.TITLE',
    parent: '/open-source',
  },
  '/open-source/npm': {
    labelKey: 'NPM_PACKAGES_PAGE.TITLE',
    parent: '/open-source',
  },
  '/web-applications': { labelKey: 'WEB_APPLICATIONS_PAGE.TITLE', parent: '/' },
  '/api-services': { labelKey: 'API_SERVICES_PAGE.TITLE', parent: '/' },
};

const resolveParent = (pathname: string): string | null => {
  const node = BREADCRUMB_TREE[pathname];
  if (node) return node.parent;

  const trimmed = pathname.slice(0, pathname.lastIndexOf('/')) || '/';
  return trimmed !== pathname && BREADCRUMB_TREE[trimmed] ? trimmed : null;
};

export const getBreadcrumbAncestors = (pathname: string): BreadcrumbEntry[] => {
  const crumbs: BreadcrumbEntry[] = [];
  let current = resolveParent(pathname);

  while (current) {
    const node = BREADCRUMB_TREE[current];
    if (!node) break;
    crumbs.unshift({ path: current, labelKey: node.labelKey });
    current = node.parent;
  }

  return crumbs;
};
