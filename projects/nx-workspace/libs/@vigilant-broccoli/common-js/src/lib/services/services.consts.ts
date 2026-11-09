export const QUEUE = {
  EMAIL: 'EMAIL',
  EMAIL_DLQ: 'EMAIL_DLQ',
  EMAIL_SUBSCRIPTION: 'EMAIL_SUBSCRIPTION',
  EMAIL_SUBSCRIPTION_DLQ: 'EMAIL_SUBSCRIPTION_DLQ',
};

export const EMAIL_SERVICE_ENDPOINT = {
  QUEUE_EMAILS: 'api/queue-emails',
  SEND_EMAIL: 'api/send-email',
};

export const LLM_SERVICE_ENDPOINT = {
  LLM: 'api/llm',
  CHAT: 'api/chat',
};

export const MEDIA_SERVICE_ENDPOINT = {
  RECEIPTS_IMAGE: 'api/receipts/image',
  RECEIPTS_LLM_IMAGE: 'api/receipts/llm-image',
  WHERE_IS_IMAGE: 'api/where-is/image',
  WHERE_IS_LLM_IMAGE: 'api/where-is/llm-image',
  DOCS_FILE: 'api/docs/file',
};

export const MEDIA_SERVICE_FILE_FIELD = 'file';
export const MEDIA_SERVICE_FILE_NAME_HEADER = 'x-file-name';

export const VB_EXPRESS_ENDPOINT = {
  SPEECH_TO_TEXT: 'api/speech-to-text',
  TEXT_TO_SPEECH: 'api/text-to-speech',
  VOICE_LIST: 'api/voice-list',
  LLM: 'api/llm',
  CHAT: 'api/chat',
  CALENDAR_PARSE: 'api/calendar/parse',
  TASKS_PARSE_IMAGE: 'api/tasks/parse-image',
  WHERE_IS_ANALYZE: 'api/where-is/analyze',
  PRICE_TRACKER_ANALYZE: 'api/price-tracker/analyze',
  RECIPE_SCRAPE: 'api/recipe/scrape',
  SEND_EMAIL: 'api/messaging/send-email',
};

export const VB_EXPRESS_ADMIN_ENDPOINT = {
  API_KEYS: 'api/admin/api-keys',
};

export const VB_EXPRESS_SERVICE = {
  MESSAGING: 'messaging',
  TASKS: 'tasks',
  LLM: 'llm',
  CHAT: 'chat',
  CALENDAR: 'calendar',
  VOICE_LIST: 'voice-list',
  SPEECH_TO_TEXT: 'speech-to-text',
  TEXT_TO_SPEECH: 'text-to-speech',
  WHERE_IS: 'where-is',
  PRICE_TRACKER: 'price-tracker',
  RECIPE: 'recipe',
  STORAGE: 'storage',
};
