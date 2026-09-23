export const ROUTE_PATH = {
  HOME: '/',
  CONTACT: '/contact',
  FAQ: '/faq',
  MORE: '/more',
  MORE_SUBPAGE: '/more/:id',
  PLAYLISTS: '/playlists',
  TERMINOLOGY: '/skate-terminology',
  WAIVER: '/waiver',
  CALENDAR: '/calendar',
  GALLERY: '/gallery',
  ALBUM: '/gallery/:albumSlug',
  WILD_CARD: '*',
} as const;

export const EXTERNAL_URL = {
  WAIVER_DOC:
    'https://docs.google.com/document/d/1ll19WybAa0mxTtXJZwUVu1WVHZFbylDezAl-05b1glQ/edit?usp=sharing',
  CLOUD_8_SKATE_IG: 'https://www.instagram.com/cloud8skate/',
} as const;

export const SITE_URL = 'https://cloud8skate.com';

export const LOGO_PATH = '/assets/cloud8skate.png';

export const SITE_CONTENT = {
  ABOUT: '/assets/site-content/about.md',
  MORE: '/assets/site-content/more.md',
  TERMINOLOGY: '/assets/site-content/skate-terminology.md',
  subpage: (id: string) => `/assets/site-content/${id}.md`,
} as const;

export const NAV_LINKS = [
  { to: ROUTE_PATH.HOME, labelKey: 'NAV.HOME' },
  { to: ROUTE_PATH.WAIVER, labelKey: 'NAV.WAIVER' },
  { to: ROUTE_PATH.CALENDAR, labelKey: 'NAV.CALENDAR' },
  { to: ROUTE_PATH.GALLERY, labelKey: 'NAV.GALLERY' },
  { to: ROUTE_PATH.PLAYLISTS, labelKey: 'NAV.PLAYLISTS' },
  { to: ROUTE_PATH.FAQ, labelKey: 'NAV.FAQ' },
] as const;

export const albumPath = (slug: string) => `${ROUTE_PATH.GALLERY}/${slug}`;
