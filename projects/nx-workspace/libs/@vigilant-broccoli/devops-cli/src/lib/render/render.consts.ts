export const RENDER_CLI = 'render';

export const RenderCommand = {
  login: ['login'],
  listServices: ['services', '--output', 'json', '--confirm'],
  whoami: ['whoami', '--output', 'json'],
  listWorkspaces: ['workspaces', '--output', 'json', '--confirm'],
  setWorkspace: (workspaceId: string) =>
    ['workspace', 'set', workspaceId, '--confirm'] as const,
} as const;

export const RENDER_NO_WORKSPACE_ERROR = 'no workspace set';

export const RENDER_AUTH_ERROR_STRINGS = [
  'not logged in',
  'unauthorized',
  'authentication required',
  'no cli token',
] as const;

export const RENDER_LOGIN_FAILURE = {
  failed: 'failed',
  timedOut: 'timedOut',
  tokenMissing: 'tokenMissing',
} as const;

export type RenderLoginFailure =
  (typeof RENDER_LOGIN_FAILURE)[keyof typeof RENDER_LOGIN_FAILURE];
