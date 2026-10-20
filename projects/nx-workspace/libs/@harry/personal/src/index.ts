import { EMAIL_ADDRESS } from './email-address.const';

export { EMAIL_ADDRESS };

export const APP_NAME = {
  HARRYLIU_DESIGN: 'HARRYLIU_DESIGN',
  CLOUD_8_SKATE: 'CLOUD_8_SKATE',
} as const;

export type AppName = (typeof APP_NAME)[keyof typeof APP_NAME];

export interface MessageRequest {
  appName: AppName;
  name: string;
  email: string;
  message: string;
}

export const PERSONAL_WEBSITE_BACKEND_ENDPOINTS = {
  SEND_MESSAGE: '/contact/send-message',
} as const;

export const SENDER_EMAIL_ADDRESS = 'contact@harryliu.dev';

export const EMAIL_LINK = {
  NAME: EMAIL_ADDRESS,
  URL: `mailto:${EMAIL_ADDRESS}`,
} as const;

export const SOCIAL_LINK = {
  LINKEDIN: {
    NAME: 'LinkedIn',
    URL: 'https://www.linkedin.com/in/iamharryliu/',
  },
  GITHUB: {
    NAME: 'GitHub',
    URL: 'https://github.com/iamharryliu',
  },
  INSTAGRAM_PRETTYDAMNTIRED: {
    NAME: 'Instagram - prettydamntired',
    URL: 'https://www.instagram.com/prettydamntired/',
  },
  INSTAGRAM_TORONTOCITYSKATE: {
    NAME: 'Instagram - torontocityskate',
    URL: 'https://www.instagram.com/torontocityskate/',
  },
  INSTAGRAM_HARRYSELLSSHIT: {
    NAME: 'Instagram - harrysellsshit',
    URL: 'https://www.instagram.com/harrysellsshit/',
  },
  INSTAGRAM_CLOUD8SKATE: {
    NAME: 'Instagram - cloud8skate',
    URL: 'https://www.instagram.com/cloud8skate/',
  },
  INSTAGRAM_MALMOURBANSKATE: {
    NAME: 'Instagram - malmo.urbanskate',
    URL: 'https://www.instagram.com/malmo.urbanskate/',
  },
  INSTAGRAM_HUSTLEMALMO: {
    NAME: 'Instagram - hustlemalmo',
    URL: 'https://www.instagram.com/hustlemalmo/',
  },
} as const;

export const COMMUNITY_LINK = {
  CLOUD8SKATE: {
    NAME: 'Cloud 8 Skate',
    URL: 'https://cloud8skate.com/',
  },
} as const;

export const PROJECT_LINK = {
  CALENDAR: {
    NAME: 'Calendar',
    URL: 'https://calendar.harryliu.dev/',
  },
  SOFTWARE_PROJECTS: {
    NAME: 'Software Projects',
    URL: 'https://projects.harryliu.dev/',
  },
} as const;

export const BUSINESS_LINK = {
  SECONDHAND_STORE: {
    NAME: 'harrysellsshit',
    URL: SOCIAL_LINK.INSTAGRAM_HARRYSELLSSHIT.URL,
  },
} as const;

export const INTEREST_LINK = {
  SPOTIFY: {
    NAME: 'Spotify',
    URL: 'https://open.spotify.com/user/22z5agodra7fwhm2erdqn5bjq',
  },
  GOODREADS: {
    NAME: 'Goodreads',
    URL: 'https://www.goodreads.com/user/show/74043883-harry',
  },
  MYANIMELIST: {
    NAME: 'MyAnimeList',
    URL: 'https://myanimelist.net/profile/prettydamntired',
  },
  IMDB: {
    NAME: 'IMDb',
    URL: 'https://www.imdb.com/user/ur45097057/',
  },
} as const;

export * from './personal-calendar.const';
export * from './personal-calendar-embed';
