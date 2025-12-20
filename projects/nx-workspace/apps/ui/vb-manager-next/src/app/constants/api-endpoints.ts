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
} as const;
