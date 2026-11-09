const JOURNAL_BASE_PATH = '~/journal';

const VB_REPO_BASE_PATH = '~/vigilant-broccoli';

const RESILIO_SYNC_BASE_PATH = '~/resilio-sync';

export const JOURNAL_PATH = {
  TODO: `${JOURNAL_BASE_PATH}/productivity/TODO.md`,
  EXPIRATION: `${JOURNAL_BASE_PATH}/management/expiration.md`,
  FOOD: `${JOURNAL_BASE_PATH}/Food.md`,
} as const;

export const VB_REPO_PATH = {
  TODO: `${VB_REPO_BASE_PATH}/TODO.md`,
  SPOTIFY_TO_MP3_SCRIPT: `${VB_REPO_BASE_PATH}/scripts/python/dj-scripts/spotify-to-mp3`,
} as const;

export const RESILIO_SYNC_PATH = {
  DJ_MUSIC_LIBRARY: `${RESILIO_SYNC_BASE_PATH}/media/dj-music-library`,
} as const;
