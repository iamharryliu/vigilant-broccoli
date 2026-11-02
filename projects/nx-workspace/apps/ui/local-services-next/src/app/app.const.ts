export const APP_NAME = 'Local Services';

// Set by next.config.js. Client fetches and `fetch`-style URLs are not
// basePath-aware, so every API URL goes through withBasePath.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH as string;

export const withBasePath = (path: string) => `${BASE_PATH}${path}`;
