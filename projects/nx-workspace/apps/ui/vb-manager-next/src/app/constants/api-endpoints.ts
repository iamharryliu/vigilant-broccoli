export const API_ENDPOINTS = {
  // Docker
  DOCKER_CONTAINERS: '/api/docker/containers',
  DOCKER_START: '/api/docker/start',
  DOCKER_STOP: '/api/docker/stop',

  // PM2
  PM2_PROCESSES: '/api/pm2/processes',
  PM2_START: '/api/pm2/start',
  PM2_STOP: '/api/pm2/stop',
  PM2_RESTART: '/api/pm2/restart',

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

  // Tasks
  TASKS: '/api/tasks',
  TASKS_LISTS: '/api/tasks/lists',

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
