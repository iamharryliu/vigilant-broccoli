const JOURNAL_BASE_PATH = '~/journal';

const VB_REPO_BASE_PATH = '~/vigilant-broccoli';

// The Drive for Desktop mount; a plain ~/My Drive folder is not synced.
const GOOGLE_DRIVE_BASE_PATH =
  '~/Library/CloudStorage/GoogleDrive-harryliu1995@gmail.com/My Drive';

export const JOURNAL_PATH = {
  TODO: `${JOURNAL_BASE_PATH}/productivity/TODO.md`,
  EXPIRATION: `${JOURNAL_BASE_PATH}/management/expiration.md`,
  FOOD: `${JOURNAL_BASE_PATH}/Food.md`,
} as const;

export const VB_REPO_PATH = {
  TODO: `${VB_REPO_BASE_PATH}/TODO.md`,
  SPOTIFY_TO_MP3_SCRIPT: `${VB_REPO_BASE_PATH}/scripts/python/dj-scripts/spotify-to-mp3`,
} as const;

export const GOOGLE_DRIVE_PATH = {
  DJ_MUSIC_LIBRARY: `${GOOGLE_DRIVE_BASE_PATH}/DJ Music Library`,
} as const;
