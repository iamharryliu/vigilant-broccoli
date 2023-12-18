import { Route, Routes } from '@angular/router';
import { AboutPageComponent } from '@pages/about-page/about-page.component';
import { HomePageComponent } from '@pages/home-page/home-page.component';
import { ContactPageComponent } from '@pages/contact-page/contact-page.component';
import { VibecheckLiteComponent } from '@app/demo-apps/vibecheck-lite/vibecheck-lite.component';
import { LinkTreePageComponent } from '@pages/link-tree-page/link-tree-page.component';
import { Link } from '@models/app.model';
import { ENVIRONMENT } from 'src/environments/environment';
import { VerifyEmailSubscriptionPageComponent } from '@pages/verify-email-subscription/verify-email-subscription-page.component';
import { VibecheckLiteSubscribePageComponent } from '@pages/vibecheck-lite/subscribe-page/vibecheck-lite-subscribe.page';
import { VibecheckLiteUnsubscribePageComponent } from '@pages/vibecheck-lite/unsubscribe-page/unsubscribe-page.component';
import { ServicesPageComponent } from '@app/src/app/components/pages/services.page/services.page';

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
  path: 'contact-page',
  data: { title: 'contact page' },
  component: ContactPageComponent,
};

export const SERVICES_ROUTE: Route = {
  path: 'services',
  data: { title: 'services page' },
  component: ServicesPageComponent,
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
  data: { title: ' vibecheck-lite' },
  children: [VIBECHECK_LITE_APP_ROUTE, VIBECHECK_LITE_SUBSCRIBE_ROUTE],
};

export const PROJECT_ROUTE: Route = {
  path: 'projects',
  data: { title: ' projects' },
  children: [VIBECHECK_LITE_ROUTE],
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

export const APP_PATH = {
  INDEX: '',
  ABOUT_PAGE: `/${ABOUT_ROUTE.path}`,
  CONTACT_PAGE: `/${CONTACT_ROUTE.path}`,
  SERVICES_PAGE: `/${SERVICES_ROUTE.path}`,
  VIBECHECK_LITE: `/${PROJECT_ROUTE.path}/${VIBECHECK_LITE_ROUTE}/${VIBECHECK_LITE_APP_ROUTE.path}`,
};

export const APP_ROUTES: Routes = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  SERVICES_ROUTE,
  PROJECT_ROUTE,
  LINK_TREE_ROUTE,
  VERIFY_EMAIL_ROUTE,
  UNSUBCSRIBE_VIBECHECK_LITE_ROUTE,
];

const PERSONAL_WEBSITE: Link = {
  url: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}`,
  text: 'LINKS.INTERNAL.PERSONAL_WEBSITE',
  isExternalLink: true,
  target: '_blank',
};

const ABOUT_PAGE: Link = {
  url: APP_PATH.ABOUT_PAGE,
  text: 'LINKS.INTERNAL.ABOUT_PAGE',
};
const CONTACT_PAGE: Link = {
  url: APP_PATH.CONTACT_PAGE,
  text: 'LINKS.INTERNAL.CONTACT_PAGE',
};
const SERVICES_PAGE: Link = {
  url: APP_PATH.SERVICES_PAGE,
  text: 'LINKS.INTERNAL.SERVICES_PAGE',
};
const VIBECHECK_LITE_APP: Link = {
  url: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${PROJECT_ROUTE.path}/${VIBECHECK_LITE_ROUTE.path}/${VIBECHECK_LITE_APP_ROUTE.path}`,
  text: 'LINKS.EXTERNAL.VIBECHECK_LITE_APP.TEXT',
  isExternalLink: true,
  target: '_blank',
};
const VIBECHECK_LITE_SUBSCRIBE: Link = {
  url: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${PROJECT_ROUTE.path}/${VIBECHECK_LITE_ROUTE.path}/${VIBECHECK_LITE_SUBSCRIBE_ROUTE.path}`,
  text: 'LINKS.EXTERNAL.VIBECHECK_LITE_SUBSCRIBE.TEXT',
  isExternalLink: true,
  target: '_blank',
};
const LINKEDIN: Link = {
  url: ENVIRONMENT.URLS.LINKEDIN,
  text: 'LINKS.EXTERNAL.LINKEDIN.TEXT',
  isExternalLink: true,
};
const GITHUB: Link = {
  url: ENVIRONMENT.URLS.GITHUB,
  text: 'LINKS.EXTERNAL.GITHUB.TEXT',
  isExternalLink: true,
};
const PERSONAL_INSTAGRAM: Link = {
  url: ENVIRONMENT.URLS.PERSONAL_IG,
  text: 'LINKS.EXTERNAL.PERSONAL_IG.TEXT',
  isExternalLink: true,
};
const SECONDHAND_STORE_IG: Link = {
  url: ENVIRONMENT.URLS.SECONDHAND_STORE_IG,
  text: 'LINKS.EXTERNAL.SECONDHAND_STORE_IG.TEXT',
  isExternalLink: true,
};
const SKATE_IG: Link = {
  url: ENVIRONMENT.URLS.SKATE_IG,
  text: 'LINKS.EXTERNAL.SKATE_IG.TEXT',
  isExternalLink: true,
};
const RESUME: Link = {
  url: ENVIRONMENT.URLS.RESUME,
  text: 'LINKS.EXTERNAL.RESUME.TEXT',
  isExternalLink: true,
};
const LINK_TREE: Link = {
  url: ENVIRONMENT.URLS.LINK_TREE,
  text: 'LINKS.EXTERNAL.LINK_TREE.TEXT',
  isExternalLink: true,
};

export const LINKS = {
  PERSONAL_WEBSITE,
  ABOUT_PAGE,
  CONTACT_PAGE,
  SERVICES_PAGE,
  VIBECHECK_LITE_APP,
  VIBECHECK_LITE_SUBSCRIBE,
  LINKEDIN,
  GITHUB,
  PERSONAL_INSTAGRAM,
  SECONDHAND_STORE_IG,
  SKATE_IG,
  RESUME,
  LINK_TREE,
};
