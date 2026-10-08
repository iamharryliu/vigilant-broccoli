export const API_ENDPOINTS = {
  DOCKER_CONTAINERS: '/api/docker/containers',
  DOCKER_START: '/api/docker/start',
  DOCKER_STOP: '/api/docker/stop',
  DOCKER_REMOVE: '/api/docker/remove',

  PM2_PROCESSES: '/api/pm2/processes',
  PM2_START: '/api/pm2/start',
  PM2_STOP: '/api/pm2/stop',
  PM2_RESTART: '/api/pm2/restart',
  PM2_DELETE: '/api/pm2/delete',

  SHELL_EXECUTE: '/api/shell/execute',

  GCLOUD_AUTH_STATUS: '/api/gcloud/auth-status',
  GCLOUD_PROJECTS: '/api/gcloud/projects',
  GCLOUD_SET_PROJECT: '/api/gcloud/set-project',
  GCLOUD_SET_ACCOUNT: '/api/gcloud/set-account',
  GCLOUD_VAULT_TOKEN: '/api/gcloud/vault-token',

  VERCEL_PROJECTS: '/api/vercel/projects',

  FLYIO_APPS: '/api/flyio/apps',
  FLYIO_AUTH_LOGIN: '/api/flyio/auth/login',

  WRANGLER_PAGES: '/api/wrangler/pages',
  WRANGLER_LOGIN: '/api/wrangler/login',

  TERRAFORM_STATUS: '/api/terraform/status',

  GITHUB_PAGES: '/api/github/pages',

  WIREGUARD_STATUS: '/api/wireguard/status',

  TAILSCALE_MACHINES: '/api/tailscale/machines',

  PUBLIC_IP: '/api/public-ip',
  LOCAL_IP: '/api/local-ip',
  LOCAL_SERVICES: '/api/local-services',
  NETWORK_MONITOR_LAN_DEVICES: '/api/network-monitor/lan-devices',
  NETWORK_MONITOR_OUTBOUND_CONNECTIONS:
    '/api/network-monitor/outbound-connections',
  NETWORK_MONITOR_SCAN_DEVICE: '/api/network-monitor/scan-device',

  API_KEYS: '/api/api-keys',

  LOCAL_MACHINE: '/api/local-machine',
  DISK_SPACE: '/api/disk-space',
  SPEED_TEST: '/api/speed-test',

  GOOGLE_TOKEN: '/api/auth/google-token',

  TASKS: '/api/tasks',
  TASKS_LISTS: '/api/tasks/lists',
  TASKS_MOVE: '/api/tasks/move',
  TASKS_PARSE_TEXT: '/api/tasks/parse-text',

  KANBAN_BOARDS: '/api/kanban/boards',

  CALENDAR_EVENTS: '/api/calendar/events',
  EVENT_CALENDARS: '/api/event-calendars',

  WEATHER: '/api/weather',

  DJ_PLAYLISTS: '/api/dj/playlists',
  DJ_DOWNLOAD: '/api/dj/download',
  DJ_OPEN_REKORDBOX: '/api/dj/open-rekordbox',

  LLM_TEST: '/api/llm-test',
  SPEECH_TO_TEXT: '/api/speech-to-text',
  TEXT_TO_SPEECH: '/api/text-to-speech',
  VOICE_LIST: '/api/voice-list',

  AWS_PROFILES: '/api/aws/profiles',

  SSH_KEY: '/api/ssh-key',

  GENERATE_SECRET: '/api/generate-secret',

  RECIPE_SCRAPE: '/api/recipe/scrape',
  RECIPE_SCRAPE_PREVIEW: '/api/recipe/scrape-preview',

  CHAT_PUBLISH: '/api/chat/publish',

  LANGUAGE_LEARNING_WORDS: '/api/language-learning/words',
  LANGUAGE_LEARNING_HISTORY: '/api/language-learning/history',
  LANGUAGE_LEARNING_MASTERED: '/api/language-learning/mastered',
  LANGUAGE_LEARNING_DEFINE: '/api/language-learning/define',
  LANGUAGE_LEARNING_RESET: '/api/language-learning/reset',

  TODO: '/api/todo',
  TODO_SOLVE: '/api/todo/solve',
} as const;
