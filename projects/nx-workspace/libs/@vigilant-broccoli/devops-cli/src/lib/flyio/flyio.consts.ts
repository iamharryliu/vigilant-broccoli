export const FLYCTL_CLI = 'flyctl';

export const FlyioCommand = {
  authLogin: ['auth', 'login'],
  authToken: ['auth', 'token'],
  listApps: ['apps', 'list', '--json'],
  listMachines: (app: string) =>
    ['machines', 'list', '--app', app, '--json'] as const,
} as const;

export const FLYIO_AUTH_ERROR_STRINGS = [
  'no access token',
  'not logged in',
  'unauthorized',
] as const;

export const FLYIO_LOGIN_FAILURE = {
  failed: 'failed',
  timedOut: 'timedOut',
  tokenMissing: 'tokenMissing',
} as const;

export type FlyioLoginFailure =
  (typeof FLYIO_LOGIN_FAILURE)[keyof typeof FLYIO_LOGIN_FAILURE];
