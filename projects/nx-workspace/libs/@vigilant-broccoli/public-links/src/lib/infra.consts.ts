export const VB_GITHUB_REPO_URL =
  'https://github.com/iamharryliu/vigilant-broccoli';
export const VB_GITHUB_ACTIONS_URL = `${VB_GITHUB_REPO_URL}/actions`;
export const VB_GITHUB_WORKFLOWS_URL = `${VB_GITHUB_ACTIONS_URL}/workflows`;

export const HARRYLIU_INFRA_URL = {
  DRIVE: {
    NAME: 'Drive',
    URL: 'https://drive.harryliu.dev/',
  },
  NX_CACHE: {
    NAME: 'Nx Cache Health',
    URL: 'https://nx-cache.harryliu.dev/health',
  },
  LOKI: {
    NAME: 'Loki Health',
    URL: 'https://loki.harryliu.dev/health',
  },
  SOCKET_SERVER: {
    NAME: 'Socket Server Health',
    URL: 'https://socket.harryliu.dev/health',
  },
  CAREER: {
    NAME: 'Career',
    URL: 'https://career.harryliu.dev/',
  },
  STATUS: {
    NAME: 'Status',
    URL: 'https://status.harryliu.dev/',
  },
  UPTIME: {
    NAME: 'Uptime',
    URL: 'https://uptime.harryliu.dev/',
  },
} as const;
