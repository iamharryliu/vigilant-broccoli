import { Route, Routes } from '@angular/router';
import { AboutPageComponent } from '@app/components/pages/about-page/about.page';
import { HomePageComponent } from '@app/components/pages/home-page/home-page.page';
import { ContactPageComponent } from '@app/components/pages/contact-page/contact.page';
import { VibecheckLiteComponent } from '@app/demo-apps/vibecheck-lite/vibecheck-lite.component';
import { LinkTreePageComponent } from '@app/components/pages/link-tree-page/link-tree.page';
import { Link } from '@models/app.model';
import { ENVIRONMENT } from 'src/environments/environment';
import { VerifyEmailSubscriptionPageComponent } from '@pages/verify-email-subscription/verify-email-subscription-page.component';
import { VibecheckLiteSubscribePageComponent } from '@pages/vibecheck-lite/subscribe-page/vibecheck-lite-subscribe.page';
import { VibecheckLiteUnsubscribePageComponent } from '@pages/vibecheck-lite/unsubscribe-page/unsubscribe-page.component';
import { ProjectPageComponent } from '@app/components/pages/projects-page/projects.page';

export const INDEX_ROUTE: Route = {
  path: '',
  data: { title: 'home' },
  component: HomePageComponent,
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

export const CONTACT_ROUTE: Route = {
  path: 'contact',
  data: { title: 'contact page' },
  component: ContactPageComponent,
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

export const PROJECTS_INDEX_ROUTE: Route = {
  path: '',
  data: { title: 'projects' },
  component: ProjectPageComponent,
};

export const VIBECHECK_LITE_ROUTE: Route = {
  path: 'vibecheck-lite',
  data: { title: ' vibecheck lite' },
  children: [VIBECHECK_LITE_APP_ROUTE, VIBECHECK_LITE_SUBSCRIBE_ROUTE],
};

export const PROJECTS_ROUTE: Route = {
  path: 'projects',
  children: [PROJECTS_INDEX_ROUTE, VIBECHECK_LITE_ROUTE],
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

export const APP_ROUTES: Routes = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  PROJECTS_ROUTE,
  LINK_TREE_ROUTE,
  VERIFY_EMAIL_ROUTE,
  UNSUBCSRIBE_VIBECHECK_LITE_ROUTE,
];

const PERSONAL_WEBSITE: Link = {
  url: {
    internal: INDEX_ROUTE.path,
    external: ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL,
  },
  text: 'Personal Website',
};

const ABOUT_PAGE: Link = {
  url: {
    internal: `/${ABOUT_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${ABOUT_ROUTE.path}`,
  },
  text: 'About',
};

const CONTACT_PAGE: Link = {
  url: {
    internal: `/${CONTACT_ROUTE.path}`,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${CONTACT_ROUTE.path}`,
  },
  text: 'Contact',
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

const REPEAT_TIMER: Link = {
  url: {
    external: 'https://repeat-timer.pages.dev/',
  },
  text: 'Repeat Timer',
};

const LINK_TREE: Link = {
  url: {
    internal: ENVIRONMENT.URLS.LINK_TREE,
    external: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${LINK_TREE_ROUTE.path}`,
  },
  text: 'Link Tree',
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
  text: 'Secondhand Store',
};

const SKATE_IG: Link = {
  url: {
    external: ENVIRONMENT.URLS.SKATE_IG,
  },
  text: 'Toronto City Skate',
};

const RESUME: Link = {
  url: {
    external: ENVIRONMENT.URLS.RESUME,
  },
  text: 'Resume',
};

const INTERNAL_LINKS = {
  PERSONAL_WEBSITE,
  ABOUT_PAGE,
  CONTACT_PAGE,
  LINK_TREE,
  PROJECTS_PAGE,
};

const PROJECT_LINKS = {
  VIBECHECK_LITE_APP,
  VIBECHECK_LITE_SUBSCRIBE,
  REPEAT_TIMER,
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
