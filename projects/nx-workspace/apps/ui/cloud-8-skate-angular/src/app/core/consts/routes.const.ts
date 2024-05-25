import { Route } from '@angular/router';
import { Link } from 'general-components';
import { ContactPageComponent } from '../../components/pages/contact-page/contact-page.component';
import { FaqPageComponent } from '../../components/pages/faq-page/faq.page';
import { HomePageComponent } from '../../components/pages/home-page/home.page';
import { MorePageComponent } from '../../components/pages/more-page/more.page';
import { CalendarPageComponent } from '../../components/pages/calendar-page/calendar-page.component';
import { TerminologyPageComponent } from '../../components/pages/terminology-page/terminology.page';
import { PlaylistsPageComponent } from '../../components/pages/playlists-page/playlists.page';

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

export const MORE_PAGE_ROUTE: Route = {
  path: 'more',
  data: { title: 'More Info' },
  component: MorePageComponent,
};

export const PLAYLISTS_PAGE_ROUTE: Route = {
  path: 'playlists',
  data: { title: 'Playlists' },
  component: PlaylistsPageComponent,
};

export const TERMINOLOGY_PAGE_ROUTE: Route = {
  path: 'skate-terminology',
  data: { title: 'Skate Terminology' },
  component: TerminologyPageComponent,
};

export const CALENDAR_PAGE_ROUTE: Route = {
  path: 'calendar',
  data: { title: 'Calendar' },
  component: CalendarPageComponent,
};

const WILD_CARD_ROUTE: Route = {
  path: '**',
  redirectTo: '',
};

export const ROUTES: Route[] = [
  HOME_PAGE_ROUTE,
  CONTACT_PAGE_ROUTE,
  MORE_PAGE_ROUTE,
  CALENDAR_PAGE_ROUTE,
  FAQ_PAGE_ROUTE,
  PLAYLISTS_PAGE_ROUTE,
  TERMINOLOGY_PAGE_ROUTE,
  WILD_CARD_ROUTE,
];

const HOME: Link = {
  url: {
    internal: `/${HOME_PAGE_ROUTE.path}`,
  },
  text: 'Cloud8',
};

const CALENDAR: Link = {
  url: {
    internal: `/${CALENDAR_PAGE_ROUTE.path}`,
  },
  text: 'Calendar',
};

const FAQ: Link = {
  url: {
    internal: `/${FAQ_PAGE_ROUTE.path}`,
  },
  text: 'FAQ',
};

const MORE: Link = {
  url: {
    internal: `/${MORE_PAGE_ROUTE.path}`,
  },
  text: 'More',
};

const CONTACT: Link = {
  url: {
    internal: `/${CONTACT_PAGE_ROUTE.path}`,
  },
  text: 'Contact',
};

const PLAYLISTS: Link = {
  url: {
    internal: `/${PLAYLISTS_PAGE_ROUTE.path}`,
  },
  text: 'Playlists',
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
  CALENDAR,
  FAQ,
  MORE,
  PLAYLISTS,
};

export const EXTERNAL_LINKS = {
  CLOUD_8_SKATE_IG,
  TORONTO_CITY_SKATE_IG,
};

export const LINKS = {
  ...INTERNAL_LINKS,
  ...EXTERNAL_LINKS,
};
