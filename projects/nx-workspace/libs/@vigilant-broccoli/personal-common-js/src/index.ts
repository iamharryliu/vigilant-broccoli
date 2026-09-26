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

const JOURNAL_BASE_PATH = '~/journal';

const VB_REPO_BASE_PATH = '~/vigilant-broccoli';

export const JOURNAL_PATH = {
  TODO: `${JOURNAL_BASE_PATH}/productivity/TODO.md`,
  EXPIRATION: `${JOURNAL_BASE_PATH}/management/expiration.md`,
  FOOD: `${JOURNAL_BASE_PATH}/Food.md`,
} as const;

export const VB_REPO_PATH = {
  TODO: `${VB_REPO_BASE_PATH}/TODO.md`,
  SPOTIFY_TO_MP3_SCRIPT: `${VB_REPO_BASE_PATH}/scripts/python/dj-scripts/spotify-to-mp3`,
} as const;

export const PERSONAL_URL = {
  TO_DRAW: {
    NAME: 'To Draw',
    URL: 'https://ca.pinterest.com/prettydamntired/to-draw/',
  },
  TO_READ: {
    NAME: 'To Read',
    URL: 'https://www.goodreads.com/review/list/74043883-harry?ref=nav_mybooks&shelf=to-read',
  },
  TO_WATCH_ANIME: {
    NAME: 'To Watch(Anime)',
    URL: 'https://myanimelist.net/animelist/prettydamntired?status=6',
  },
  TO_WATCH_MOVIES_SHOWS: {
    NAME: 'To Watch(Movies/Shows)',
    URL: 'https://www.imdb.com/user/ur45097057/watchlist',
  },
  INSTAGRAM_SAVED: {
    NAME: 'Instagram Saved',
    URL: 'https://www.instagram.com/prettydamntired/saved/all-posts/',
  },
  REDDIT_SAVED: {
    NAME: 'Reddit Saved',
    URL: 'https://www.reddit.com/user/itzliu/saved/',
  },
  GROCERIES: {
    NAME: 'Groceries',
    URL: 'https://outlook.live.com/host/0/0d5c91ee-5be2-4b79-81ed-23e6c4580427/ToDoId',
  },
} as const;

export const EMAIL_ADDRESS = 'harryliu1995@gmail.com';

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
  SOFTWARE_PROJECTS: {
    NAME: 'Software Projects',
    URL: 'https://iamharryliu.github.io/vigilant-broccoli/',
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

export const MAC_OS_APP = {
  CHROME: {
    NAME: 'Google Chrome',
  },
  FIREFOX: {
    NAME: 'Firefox',
  },
  SPOTIFY: {
    NAME: 'Spotify',
  },
  SLACK: {
    NAME: 'Slack',
  },
  MESSAGES: {
    NAME: 'Messages',
  },
  WHATSAPP: {
    NAME: 'WhatsApp',
  },
} as const;
