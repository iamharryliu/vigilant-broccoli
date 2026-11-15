export const APP_NAME = 'Tasks';

export const APP_DESCRIPTION =
  'Your Google Tasks, standalone or embedded in any page.';

export const PAGE_TITLE = {
  HOME: 'Google Tasks',
  EMBED: 'Embedded Tasks',
  LOGIN: 'Sign In',
  AUTH_CALLBACK: 'Signing In',
  SETTINGS: 'Settings',
} as const;

export const ROUTE = {
  HOME: '/',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  SETTINGS: '/settings',
} as const;

export const API_ENDPOINT = {
  GOOGLE_TOKEN: '/api/auth/google-token',
  TASKS: '/api/tasks',
  TASK_LISTS: '/api/tasks/lists',
} as const;

export const RUNTIME_CONFIG = {
  PATH: '/runtime-config.js',
  GLOBAL: '__TASKS_RUNTIME_CONFIG__',
} as const;
