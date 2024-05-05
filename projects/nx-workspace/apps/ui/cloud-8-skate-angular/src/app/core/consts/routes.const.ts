import { Route } from '@angular/router';
import { Link } from 'general-components';
import { HomePageComponent } from '../../components/pages/home-page/home-page.component';
import { ContactPageComponent } from '../../components/pages/contact-page/contact-page.component';

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

const WILD_CARD_ROUTE: Route = {
  path: '**',
  redirectTo: '',
};

export const ROUTES: Route[] = [
  HOME_PAGE_ROUTE,
  CONTACT_PAGE_ROUTE,
  WILD_CARD_ROUTE,
];

const HOME: Link = {
  url: {
    internal: `/${HOME_PAGE_ROUTE.path}`,
  },
  text: 'Contact',
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
  text: 'Cloud8Skate IG',
};

const TORONTO_CITY_SKATE_IG: Link = {
  url: {
    external: 'https://www.instagram.com/torontocityskate/',
  },
  text: 'Toronto City Skate IG',
};

export const EXTERNAL_LINKS = {
  CLOUD_8_SKATE_IG,
  TORONTO_CITY_SKATE_IG,
};

export const LINKS = {
  HOME,
  CONTACT,
  ...EXTERNAL_LINKS,
};
