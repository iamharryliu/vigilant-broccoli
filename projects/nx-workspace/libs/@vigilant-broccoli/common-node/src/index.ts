export * from './lib/utils';
// Date
export * from './lib/date/date.consts';
export * from './lib/date/date.utils';
// Shell
export * from './lib/shell/shell.consts';
export * from './lib/shell/shell.utils';
export * from './lib/shell/open.service';
// File System
export * from './lib/file-system/file-system.consts';
export * from './lib/file-system/file-system.utils';
// HTTP
export * from './lib/http/http.utils';
// Logger
export * from './lib/logger/logger';
export * from './lib/logger/logger.model';
export * from './lib/logger/logger.const';
export * from './lib/logger/logger.transports';
export * from './lib/logging/logger.service';
// Middleware
export * from './lib/middleware/request-logger.middleware';
// Encryption
export * from './lib/encryption/encryption.service';
// Google Recaptcha
export * from './lib/recaptcha/recaptcha.service';
// Weather
export * from './lib/weather/openweather.service';
// Audio
export * from './lib/audio/audio.service';

export const QUEUE = {
  EMAIL: 'EMAIL',
  EMAIL_SUBSCRIPTION: 'EMAIL_SUBSCRIPTION',
};

export const EMAIL_SERVICE_ENDPOINT = {
  QUEUE_EMAILS: 'queue-emails',
  SEND_EMAIL: 'send-email',
};

export const LLM_SERVICE_ENDPOINT = {
  LLM: 'api/llm',
  CHAT: 'api/chat',
};

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
};
