export const API_ENDPOINTS = {
  // Docker
  DOCKER_CONTAINERS: '/api/docker/containers',
  DOCKER_START: '/api/docker/start',
  DOCKER_STOP: '/api/docker/stop',
  DOCKER_REMOVE: '/api/docker/remove',

  // PM2
  PM2_PROCESSES: '/api/pm2/processes',
  PM2_START: '/api/pm2/start',
  PM2_STOP: '/api/pm2/stop',
  PM2_RESTART: '/api/pm2/restart',
  PM2_DELETE: '/api/pm2/delete',

  // Shell
  SHELL_EXECUTE: '/api/shell/execute',

  // GCloud
  GCLOUD_AUTH_STATUS: '/api/gcloud/auth-status',
  GCLOUD_PROJECTS: '/api/gcloud/projects',
  GCLOUD_SET_PROJECT: '/api/gcloud/set-project',
  GCLOUD_SET_ACCOUNT: '/api/gcloud/set-account',

  // Vercel
  VERCEL_PROJECTS: '/api/vercel/projects',

  // Fly.io
  FLYIO_APPS: '/api/flyio/apps',
  FLYIO_AUTH_LOGIN: '/api/flyio/auth/login',

  // Wrangler
  WRANGLER_PAGES: '/api/wrangler/pages',
  WRANGLER_LOGIN: '/api/wrangler/login',

  // GitHub
  GITHUB_PAGES: '/api/github/pages',

  // WireGuard
  WIREGUARD_STATUS: '/api/wireguard/status',

  // Tailscale
  TAILSCALE_MACHINES: '/api/tailscale/machines',

  // Network
  PUBLIC_IP: '/api/public-ip',
  LOCAL_IP: '/api/local-ip',
  LOCAL_SERVICES: '/api/local-services',
  NETWORK_MONITOR_LAN_DEVICES: '/api/network-monitor/lan-devices',
  NETWORK_MONITOR_OUTBOUND_CONNECTIONS:
    '/api/network-monitor/outbound-connections',
  NETWORK_MONITOR_SCAN_DEVICE: '/api/network-monitor/scan-device',

  // API key manager
  API_KEYS: '/api/api-keys',

  // System
  LOCAL_MACHINE: '/api/local-machine',
  DISK_SPACE: '/api/disk-space',
  SPEED_TEST: '/api/speed-test',

  // Tasks
  TASKS: '/api/tasks',
  TASKS_LISTS: '/api/tasks/lists',
  TASKS_MOVE: '/api/tasks/move',
  TASKS_PARSE_TEXT: '/api/tasks/parse-text',

  // Kanban
  KANBAN_BOARDS: '/api/kanban/boards',

  // Calendar
  CALENDAR_EVENTS: '/api/calendar/events',

  // Weather
  WEATHER: '/api/weather',

  // DJ
  DJ_PLAYLISTS: '/api/dj/playlists',
  DJ_DOWNLOAD: '/api/dj/download',
  DJ_OPEN_REKORDBOX: '/api/dj/open-rekordbox',

  // LLM
  LLM_TEST: '/api/llm-test',
  SPEECH_TO_TEXT: '/api/speech-to-text',
  TEXT_TO_SPEECH: '/api/text-to-speech',
  VOICE_LIST: '/api/voice-list',

  // AWS
  AWS_PROFILES: '/api/aws/profiles',

  // SSH
  SSH_KEY: '/api/ssh-key',

  // Secret
  GENERATE_SECRET: '/api/generate-secret',

  // Recipe
  RECIPE_SCRAPE: '/api/recipe/scrape',
  RECIPE_SCRAPE_PREVIEW: '/api/recipe/scrape-preview',

  // Chat
  CHAT_PUBLISH: '/api/chat/publish',

  // Language Learning
  LANGUAGE_LEARNING_WORDS: '/api/language-learning/words',
  LANGUAGE_LEARNING_HISTORY: '/api/language-learning/history',
  LANGUAGE_LEARNING_MASTERED: '/api/language-learning/mastered',
  LANGUAGE_LEARNING_DEFINE: '/api/language-learning/define',
  LANGUAGE_LEARNING_RESET: '/api/language-learning/reset',
} as const;
