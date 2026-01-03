const JOURNAL_BASE_PATH =
  '~/Library/Mobile Documents/iCloud~md~obsidian/Documents/journal';

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
  RESUME: {
    NAME: 'Resume',
    URL: 'https://docs.google.com/document/d/1s6Wy8i4zU85o19qyXKhdpH4jdTP36QDPUgZdV7E6-QU/edit#heading=h.uzt44hq0695d',
  },
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
  HOME_MANAGEMENT: {
    NAME: 'Home Management',
    URL: 'https://docs.google.com/document/d/1-kKUgs80h0BLM_KijHhSXp68i3omaAeg-54LTF47PA8/edit?usp=sharing',
  },
} as const;

export const MAC_OS_APP = {
  SPOTIFY: {
    NAME: 'Spotify',
  },
  SLACK: {
    NAME: 'Slack',
  },
} as const;