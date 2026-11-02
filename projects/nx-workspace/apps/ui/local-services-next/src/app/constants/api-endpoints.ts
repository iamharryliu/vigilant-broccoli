import { withBasePath } from '../app.const';

export const API_ENDPOINTS = {
  DOCKER_CONTAINERS: withBasePath('/api/docker/containers'),
  DOCKER_START: withBasePath('/api/docker/start'),
  DOCKER_STOP: withBasePath('/api/docker/stop'),
  DOCKER_REMOVE: withBasePath('/api/docker/remove'),

  PM2_PROCESSES: withBasePath('/api/pm2/processes'),
  PM2_START: withBasePath('/api/pm2/start'),
  PM2_STOP: withBasePath('/api/pm2/stop'),
  PM2_RESTART: withBasePath('/api/pm2/restart'),
  PM2_DELETE: withBasePath('/api/pm2/delete'),

  SHELL_EXECUTE: withBasePath('/api/shell/execute'),

  WIREGUARD_STATUS: withBasePath('/api/wireguard/status'),

  TAILSCALE_MACHINES: withBasePath('/api/tailscale/machines'),

  PUBLIC_IP: withBasePath('/api/public-ip'),
  LOCAL_IP: withBasePath('/api/local-ip'),
  LOCAL_SERVICES: withBasePath('/api/local-services'),
  LOCAL_CREDENTIALS: withBasePath('/api/local-credentials'),

  DISK_SPACE: withBasePath('/api/disk-space'),
  SPEED_TEST: withBasePath('/api/speed-test'),

  SSH_KEY: withBasePath('/api/ssh-key'),

  GENERATE_SECRET: withBasePath('/api/generate-secret'),
} as const;
