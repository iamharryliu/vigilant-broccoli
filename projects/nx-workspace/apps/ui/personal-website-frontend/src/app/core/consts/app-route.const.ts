import { Route, Routes } from '@angular/router';
import { ENVIRONMENT } from '../../../environments/environment';
import { AdminComponent } from '../../admin/admin.component';
import { AboutPageComponent } from '../../components/pages/about-page/about.page';
import { HomePageComponent } from '../../components/pages/home-page/home.page';
import { LinkTreePageComponent } from '../../components/pages/link-tree-page/link-tree.page';
import { VerifyEmailSubscriptionPageComponent } from '../../components/pages/verify-email-subscription/verify-email-subscription-page.component';
import { VibecheckLiteSubscribePageComponent } from '../../components/pages/vibecheck-lite/subscribe-page/vibecheck-lite-subscribe.page';
import { VibecheckLiteUnsubscribePageComponent } from '../../components/pages/vibecheck-lite/unsubscribe-page/unsubscribe-page.component';
import { VibecheckLiteComponent } from '../../demo-apps/vibecheck-lite/vibecheck-lite.component';
import { Link } from '../models/app.model';
import { MdLibraryComponent } from '../../docs-md/docs-md.page';
import { ProjectsPageComponent } from '../../components/pages/projects-page.component';
import { LeetCodePageComponent } from '../../leet-code/leet-code-page.component';

export const INDEX_ROUTE: Route = {
  path: '',
  data: { title: 'home' },
  component: HomePageComponent,
};

export const ADMIN_ROUTE: Route = {
  path: 'admin',
  data: { title: 'admin' },
  component: AdminComponent,
};

export const DOCS_MD_FILE_ROUTE: Route = {
  path: ':filename',
  data: { title: 'DocsMD' },
  component: MdLibraryComponent,
};

export const DOCS_MD_ROUTE: Route = {
  path: 'docs-md',
  data: { title: 'DocsMD' },
  children: [DOCS_MD_FILE_ROUTE],
};

export const ABOUT_ROUTE: Route = {
  path: 'about',
  data: { title: 'about' },
  component: AboutPageComponent,
};

export const LINK_TREE_ROUTE: Route = {
  path: 'links',
  data: { title: ' link tree' },
  component: LinkTreePageComponent,
};

export const VIBECHECK_LITE_APP_ROUTE: Route = {
  path: 'app',
  data: { title: 'vibecheck lite' },
  component: VibecheckLiteComponent,
};

export const VIBECHECK_LITE_SUBSCRIBE_ROUTE: Route = {
  path: 'subscribe',
  data: { title: 'subscribe to vibecheck lite' },
  component: VibecheckLiteSubscribePageComponent,
};

export const VIBECHECK_LITE_ROUTE: Route = {
  path: 'vibecheck-lite',
  data: { title: ' vibecheck lite' },
  children: [VIBECHECK_LITE_APP_ROUTE, VIBECHECK_LITE_SUBSCRIBE_ROUTE],
};

export const PROJECTS_PAGE_ROUTE: Route = {
  path: '',
  data: { title: 'projects' },
  component: ProjectsPageComponent,
};

export const PROJECTS_ROUTE: Route = {
  path: 'projects',
  children: [VIBECHECK_LITE_ROUTE, PROJECTS_PAGE_ROUTE],
};

export const VERIFY_EMAIL_ROUTE: Route = {
  path: 'verify-email-subscription',
  data: { title: 'verify email sub' },
  component: VerifyEmailSubscriptionPageComponent,
};

export const UNSUBCSRIBE_VIBECHECK_LITE_ROUTE: Route = {
  path: 'unsubscribe-vibecheck-lite',
  data: { title: 'unsubscribe to vibecheck lite' },
  component: VibecheckLiteUnsubscribePageComponent,
};

export const LEETCODE_ROUTE: Route = {
  path: 'grind-75',
  data: { title: 'grind 75' },
  component: LeetCodePageComponent,
};

export const APP_ROUTES: Routes = [
  INDEX_ROUTE,
  ADMIN_ROUTE,
  ABOUT_ROUTE,
  PROJECTS_ROUTE,
  DOCS_MD_ROUTE,
  LINK_TREE_ROUTE,
  VERIFY_EMAIL_ROUTE,
  UNSUBCSRIBE_VIBECHECK_LITE_ROUTE,
  PROJECTS_PAGE_ROUTE,
  LEETCODE_ROUTE,
];

const INDEX_PAGE: Link = {
  url: {
    internal: INDEX_ROUTE.path,
    external: ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL,
  },
  text: 'Home',
};

const ABOUT_PAGE: Link = {
  url: {
    internal: `/${ABOUT_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${ABOUT_ROUTE.path}`,
  },
  text: 'About',
};

const PROJECTS_PAGE: Link = {
  url: {
    internal: `/${PROJECTS_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${PROJECTS_ROUTE.path}`,
  },
  text: 'Projects',
};

const VIBECHECK_LITE_APP: Link = {
  url: {
    internal: `/${PROJECTS_ROUTE.path}/${VIBECHECK_LITE_ROUTE}/${VIBECHECK_LITE_APP_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${PROJECTS_ROUTE.path}/${VIBECHECK_LITE_ROUTE.path}/${VIBECHECK_LITE_APP_ROUTE.path}`,
  },
  text: 'Vibecheck Lite',
};

const VIBECHECK_LITE_SUBSCRIBE: Link = {
  url: {
    internal: `/${PROJECTS_ROUTE.path}/${VIBECHECK_LITE_ROUTE.path}/${VIBECHECK_LITE_SUBSCRIBE_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${PROJECTS_ROUTE.path}/${VIBECHECK_LITE_ROUTE.path}/${VIBECHECK_LITE_SUBSCRIBE_ROUTE.path}`,
  },
  text: 'Subscribe to Vibecheck Lite',
};

const LINK_TREE: Link = {
  url: {
    internal: `/${LINK_TREE_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${LINK_TREE_ROUTE.path}`,
  },
  text: 'Links',
};

const LINKEDIN: Link = {
  url: {
    external: ENVIRONMENT.URLS.LINKEDIN,
  },
  text: 'LinkedIn',
};

const GITHUB: Link = {
  url: {
    external: ENVIRONMENT.URLS.GITHUB,
  },
  text: 'Github',
};

const PERSONAL_INSTAGRAM: Link = {
  url: {
    external: ENVIRONMENT.URLS.PERSONAL_IG,
  },
  text: 'Personal Instagram',
};

const SECONDHAND_STORE_IG: Link = {
  url: {
    external: ENVIRONMENT.URLS.SECONDHAND_STORE_IG,
  },
  text: 'harrysellsshit',
};

const SKATE_IG: Link = {
  url: {
    external: ENVIRONMENT.URLS.SKATE_IG,
  },
  text: 'torontocityskate',
};

const RESUME: Link = {
  url: {
    external: ENVIRONMENT.URLS.RESUME,
  },
  text: 'Resume',
};

const MD_LIBRARY: Link = {
  url: {
    internal: `/${DOCS_MD_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${DOCS_MD_ROUTE.path}`,
  },
  text: 'DocsMD',
};

const INTERNAL_LINKS = {
  INDEX_PAGE,
  ABOUT_PAGE,
  LINK_TREE,
  PROJECTS_PAGE,
  MD_LIBRARY,
};

const PROJECT_LINKS = {
  VIBECHECK_LITE_APP,
  VIBECHECK_LITE_SUBSCRIBE,
};

const EXTERNAL_LINKS = {
  LINKEDIN,
  GITHUB,
  PERSONAL_INSTAGRAM,
  SECONDHAND_STORE_IG,
  SKATE_IG,
  RESUME,
};

export const LINKS = {
  ...INTERNAL_LINKS,
  ...PROJECT_LINKS,
  ...EXTERNAL_LINKS,
};
