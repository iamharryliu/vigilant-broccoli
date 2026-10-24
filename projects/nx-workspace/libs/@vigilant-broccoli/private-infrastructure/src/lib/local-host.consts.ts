// Hosts reachable only on the private Tailscale network.
export const LOCAL_HOST_URL = {
  IMMICH: {
    NAME: 'Immich (Local)',
    URL: 'https://images.vigilant-broccoli.app',
  },
  GRAFANA: {
    NAME: 'Grafana (Local)',
    URL: 'https://grafana.vigilant-broccoli.app',
  },
  LOKI: {
    NAME: 'Loki (Local)',
    URL: 'https://loki.vigilant-broccoli.app/ready',
  },
  HEADLAMP: {
    NAME: 'Headlamp (Local)',
    URL: 'https://headlamp.vigilant-broccoli.app',
  },
  VB_MANAGER_NEXT: {
    NAME: 'VB Manager (Local)',
    URL: 'https://manager.vigilant-broccoli.app',
  },
} as const;
