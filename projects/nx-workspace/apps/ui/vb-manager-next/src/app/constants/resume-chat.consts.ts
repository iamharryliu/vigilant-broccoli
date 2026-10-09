export const RESUME_CHAT_RESPONSE_TYPE = {
  TEXT: 'text',
  RESUME_UPDATE: 'resume_update',
  PROGRESS: 'progress',
  ERROR: 'error',
} as const;

export const RESUME_CHAT_TOOL_NAME = {
  UPDATE_RESUME: 'update_resume',
  RECORD_TAILORING_CONTEXT: 'record_tailoring_context',
} as const;

export const RESUME_CHAT_VALIDATION_STATUS = {
  VALIDATED: 'validated',
  UNVALIDATED: 'unvalidated',
} as const;

export const RESUME_CHAT_API_PATH = '/api/resume/chat';

export const RESUME_CHAT_LIMITS = {
  MAX_MESSAGES: 60,
  MAX_MESSAGE_CHARS: 20_000,
  MAX_CONTEXT_ITEMS: 60,
  MAX_CONTEXT_ITEM_CHARS: 600,
  MAX_REVISIONS: 3,
} as const;

export const RESUME_CHAT_MODEL = 'gpt-5.5';
