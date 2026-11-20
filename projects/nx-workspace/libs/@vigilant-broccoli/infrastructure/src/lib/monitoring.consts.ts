export const VB_MONITORING_URL = {
  NX_CACHE: {
    NAME: 'Nx Cache Health',
    URL: 'https://nx-cache.vigilant-broccoli.app/health',
  },
  LOKI: {
    NAME: 'Loki Health',
    URL: 'https://loki.vigilant-broccoli.app/health',
  },
  SOCKET_SERVER: {
    NAME: 'Socket Server Health',
    URL: 'https://socket.harryliu.dev/health',
  },
  DEPLOYMENTS: {
    NAME: 'Deployments',
    URL: 'https://deployments.vigilant-broccoli.app/',
  },
  STATUS: {
    NAME: 'Status',
    URL: 'https://status.vigilant-broccoli.app/',
  },
  UPTIME: {
    NAME: 'Uptime',
    URL: 'https://uptime.vigilant-broccoli.app/',
  },
} as const;
