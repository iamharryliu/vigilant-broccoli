import { Route, Routes } from '@angular/router';
import { AboutPageComponent } from '@pages/about-page/about-page.component';
import { HomePageComponent } from '@pages/home-page/home-page.component';
import { ContactPageComponent } from '@pages/contact-page/contact-page.component';
import { VibecheckLiteComponent } from '@app/demo-apps/vibecheck-lite/vibecheck-lite.component';
import { LinkTreePageComponent } from '@pages/link-tree-page/link-tree-page.component';
import { Link } from '@models/app.model';
import { ENVIRONMENT } from 'src/environments/environment';
import { VerifyEmailSubscriptionPageComponent } from '@pages/verify-email-subscription/verify-email-subscription-page.component';

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

export const VIBECHECK_LITE_ROUTE: Route = {
  path: 'vibecheck-lite',
  data: { title: ' vibecheck lite' },
  component: VibecheckLiteComponent,
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

export const APP_PATH = {
  INDEX: '',
  ABOUT: `/${ABOUT_ROUTE.path}`,
  CONTACT_PAGE: `/${CONTACT_ROUTE.path}`,
  VIBECHECK_LITE: `/${PROJECT_ROUTE.path}/${VIBECHECK_LITE_ROUTE.path}`,
};

export const APP_ROUTES: Routes = [
  INDEX_ROUTE,
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  PROJECT_ROUTE,
  LINK_TREE_ROUTE,
  VERIFY_EMAIL_ROUTE,
];

const PERSONAL_WEBSITE: Link = {
  url: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}`,
  text: 'LINKS.INTERNAL.PERSONAL_WEBSITE',
  isExternalLink: true,
  target: '_blank',
};

const ABOUT_PAGE: Link = {
  url: APP_PATH.ABOUT,
  text: 'LINKS.INTERNAL.ABOUT_PAGE',
};
const CONTACT_PAGE: Link = {
  url: APP_PATH.CONTACT_PAGE,
  text: 'LINKS.INTERNAL.CONTACT_PAGE',
};
const VIBECHECK_LITE: Link = {
  url: `${ENVIRONMENT.URLS.PERSONAL_WEBSITE_FRONTEND_URL}/${PROJECT_ROUTE.path}/${VIBECHECK_LITE_ROUTE.path}`,
  text: 'LINKS.EXTERNAL.VIBECHECK_LITE.TEXT',
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

export const LINKS = {
  PERSONAL_WEBSITE,
  ABOUT_PAGE,
  CONTACT_PAGE,
  VIBECHECK_LITE,
  LINKEDIN,
  GITHUB,
  PERSONAL_INSTAGRAM,
  SECONDHAND_STORE_IG,
  SKATE_IG,
};
