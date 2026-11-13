export const APP_NAME = 'Tasks';

export const APP_DESCRIPTION =
  'Your Google Tasks, standalone or embedded in any page.';

export const PAGE_TITLE = {
  HOME: 'Google Tasks',
  EMBED: 'Embedded Tasks',
  LOGIN: 'Sign In',
  AUTH_CALLBACK: 'Signing In',
} as const;

export const ROUTE = {
  HOME: '/',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
} as const;

export const API_ENDPOINT = {
  GOOGLE_TOKEN: '/api/auth/google-token',
} as const;
