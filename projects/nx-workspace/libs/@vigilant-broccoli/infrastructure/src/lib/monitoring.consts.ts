export const VB_MONITORING_URL = {
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
  STATUS: {
    NAME: 'Status',
    URL: 'https://status.harryliu.dev/',
  },
  UPTIME: {
    NAME: 'Uptime',
    URL: 'https://uptime.harryliu.dev/',
  },
} as const;
