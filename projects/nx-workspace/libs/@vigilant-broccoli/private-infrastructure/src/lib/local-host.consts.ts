import { LOCAL_MANAGER_URL } from '@vigilant-broccoli/infrastructure';

// Hosts reachable only on the private Tailscale network.
export const LOCAL_HOST_URL = {
  IMMICH: {
    NAME: 'Immich (Local)',
    URL: 'https://images.vigilant-broccoli.internal',
  },
  GRAFANA: {
    NAME: 'Grafana (Local)',
    URL: 'https://grafana.vigilant-broccoli.internal',
  },
  LOKI: {
    NAME: 'Loki (Local)',
    URL: 'https://loki.vigilant-broccoli.internal/ready',
  },
  HEADLAMP: {
    NAME: 'Headlamp (Local)',
    URL: 'https://headlamp.vigilant-broccoli.internal',
  },
  JOB_HUNT: {
    NAME: 'Job Hunt (Local)',
    URL: 'https://job-hunt.vigilant-broccoli.internal',
  },
  LOCAL_MANAGER_NEXT: {
    NAME: 'local-manager-next (Local)',
    URL: LOCAL_MANAGER_URL,
  },
} as const;
