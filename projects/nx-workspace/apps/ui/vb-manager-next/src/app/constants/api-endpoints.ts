export const API_ENDPOINTS = {
  // Docker
  DOCKER_CONTAINERS: '/api/docker/containers',
  DOCKER_START: '/api/docker/start',
  DOCKER_STOP: '/api/docker/stop',

  // Shell
  SHELL_EXECUTE: '/api/shell/execute',

  // GCloud
  GCLOUD_AUTH_STATUS: '/api/gcloud/auth-status',

  // Fly.io
  FLYIO_APPS: '/api/flyio/apps',

  // Wrangler
  WRANGLER_PAGES: '/api/wrangler/pages',

  // WireGuard
  WIREGUARD_STATUS: '/api/wireguard/status',

  // Network
  PUBLIC_IP: '/api/public-ip',
  LOCAL_IP: '/api/local-ip',

  // DJ
  DJ_PLAYLISTS: '/api/dj/playlists',
  DJ_DOWNLOAD: '/api/dj/download',
  DJ_OPEN_REKORDBOX: '/api/dj/open-rekordbox',

  // LLM
  LLM_TEST: '/api/llm-test',

  // SSH
  SSH_KEY: '/api/ssh-key',

  // Secret
  GENERATE_SECRET: '/api/generate-secret',

  // Recipe
  RECIPE_SCRAPE: '/api/recipe/scrape',
} as const;

import { VB_EXPRESS_BASE_URL } from '../../lib/vb-express-config';

export const VB_EXPRESS_ENDPOINTS = {
  TASKS: `${VB_EXPRESS_BASE_URL}/api/tasks`,
  TASKS_LISTS: `${VB_EXPRESS_BASE_URL}/api/tasks/lists`,
  LLM: `${VB_EXPRESS_BASE_URL}/api/llm`,
} as const;
