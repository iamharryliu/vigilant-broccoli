import { Route } from '@angular/router';
import { Link } from 'general-components';
import { HomePageComponent } from '../../components/pages/home-page/home-page.component';
import { ContactPageComponent } from '../../components/pages/contact-page/contact-page.component';
import { FaqPageComponent } from '../../components/pages/faq-page/faq.page';

export const HOME_PAGE_ROUTE: Route = {
  path: '',
  data: { title: 'Home' },
  component: HomePageComponent,
};

export const CONTACT_PAGE_ROUTE: Route = {
  path: 'contact',
  data: { title: 'Contact' },
  component: ContactPageComponent,
};

export const FAQ_PAGE_ROUTE: Route = {
  path: 'faq',
  data: { title: 'FAQ' },
  component: FaqPageComponent,
};

const WILD_CARD_ROUTE: Route = {
  path: '**',
  redirectTo: '',
};

export const ROUTES: Route[] = [
  HOME_PAGE_ROUTE,
  CONTACT_PAGE_ROUTE,
  FAQ_PAGE_ROUTE,
  WILD_CARD_ROUTE,
];

const HOME: Link = {
  url: {
    internal: `/${HOME_PAGE_ROUTE.path}`,
  },
  text: 'Cloud8',
};

const FAQ: Link = {
  url: {
    internal: `/${FAQ_PAGE_ROUTE.path}`,
  },
  text: 'FAQ',
};

const CONTACT: Link = {
  url: {
    internal: `/${CONTACT_PAGE_ROUTE.path}`,
  },
  text: 'Contact',
};

const CLOUD_8_SKATE_IG: Link = {
  url: {
    external: 'https://www.instagram.com/cloud8skate/',
  },
  text: 'Cloud8Skate Instagram',
};

const TORONTO_CITY_SKATE_IG: Link = {
  url: {
    external: 'https://www.instagram.com/torontocityskate/',
  },
  text: 'Toronto City Skate Instagram',
};

export const INTERNAL_LINKS = {
  HOME,
  CONTACT,
  FAQ,
};

export const EXTERNAL_LINKS = {
  CLOUD_8_SKATE_IG,
  TORONTO_CITY_SKATE_IG,
};

export const LINKS = {
  ...INTERNAL_LINKS,
  ...EXTERNAL_LINKS,
};
