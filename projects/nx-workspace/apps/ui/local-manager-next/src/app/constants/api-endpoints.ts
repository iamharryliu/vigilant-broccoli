export const API_ENDPOINTS = {
  SHELL_EXECUTE: '/api/shell/execute',

  SECURITY_NEWS: '/api/security-news',

  LOCAL_SERVICES: '/api/local-services',

  API_KEYS: '/api/api-keys',

  LOCAL_MACHINE: '/api/local-machine',

  GOOGLE_TOKEN: '/api/auth/google-token',

  TASKS: '/api/tasks',
  TASKS_LISTS: '/api/tasks/lists',
  TASKS_MOVE: '/api/tasks/move',
  TASKS_PARSE_TEXT: '/api/tasks/parse-text',

  KANBAN_BOARDS: '/api/kanban/boards',

  CALENDAR_EVENTS: '/api/calendar/events',
  EVENT_CALENDARS: '/api/event-calendars',

  WEATHER: '/api/weather',
  WEATHER_CITY: '/api/weather/city',

  DJ_PLAYLISTS: '/api/dj/playlists',
  DJ_DOWNLOAD: '/api/dj/download',
  DJ_OPEN_REKORDBOX: '/api/dj/open-rekordbox',

  LLM_TEST: '/api/llm-test',
  SPEECH_TO_TEXT: '/api/speech-to-text',
  TEXT_TO_SPEECH: '/api/text-to-speech',
  VOICE_LIST: '/api/voice-list',

  RECIPE_SCRAPE: '/api/recipe/scrape',
  RECIPE_SCRAPE_PREVIEW: '/api/recipe/scrape-preview',

  CHAT_PUBLISH: '/api/chat/publish',

  FILE_CONVERT: '/api/file-convert',

  LANGUAGE_LEARNING_WORDS: '/api/language-learning/words',
  LANGUAGE_LEARNING_HISTORY: '/api/language-learning/history',
  LANGUAGE_LEARNING_MASTERED: '/api/language-learning/mastered',
  LANGUAGE_LEARNING_DEFINE: '/api/language-learning/define',
  LANGUAGE_LEARNING_RESET: '/api/language-learning/reset',

  TODO: '/api/todo',
  TODO_SOLVE: '/api/todo/solve',
  TODO_REMOVE: '/api/todo/remove',

  BACKGROUND_TASKS: '/api/background-tasks',

  JOB_APPLICATIONS: '/api/job-applications',
  JOB_APPLICATIONS_FILE: '/api/job-applications/file',

  // Spotify
  SPOTIFY_AUTH_LOGIN: '/api/spotify/auth/login',
  SPOTIFY_GRAPH: '/api/spotify/graph',
} as const;
