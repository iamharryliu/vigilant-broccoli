export const APP_NAME = 'Music';

// Set by next.config.js. Client fetches and `fetch`-style URLs are not
// basePath-aware, so every API URL goes through withBasePath.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH as string;

export const withBasePath = (path: string) => `${BASE_PATH}${path}`;

// local-manager-next's page that iframes this app; the Spotify OAuth callback
// returns the top window here.
export const MANAGER_MUSIC_PAGE_PATH = '/music';
