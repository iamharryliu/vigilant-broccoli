import { LLM_MODEL, type LLMModel } from '@vigilant-broccoli/common-js';

export const CALENDAR_DRAFT_MARKER = '[Calendar event draft]';

export const CHAT_RESPONSE_TYPE = {
  TOOL_CALL: 'tool_call',
} as const;

export const CHAT_TOOL_NAME = {
  CREATE_CALENDAR_EVENT: 'create_calendar_event',
} as const;

// Model eligibility supplied from the account's complimentary-token allowance.
export const CHAT_MODELS: LLMModel[] = [
  LLM_MODEL.GPT_5_4,
  LLM_MODEL.GPT_5_2,
  LLM_MODEL.GPT_5_1,
  LLM_MODEL.GPT_5,
  LLM_MODEL.GPT_4_1,
  LLM_MODEL.GPT_4O,
  LLM_MODEL.O1,
  LLM_MODEL.O3,
  LLM_MODEL.GPT_5_4_MINI,
  LLM_MODEL.GPT_5_4_NANO,
  LLM_MODEL.GPT_5_MINI,
  LLM_MODEL.GPT_5_NANO,
  LLM_MODEL.GPT_4_1_MINI,
  LLM_MODEL.GPT_4_1_NANO,
  LLM_MODEL.GPT_4O_MINI,
  LLM_MODEL.O3_MINI,
  LLM_MODEL.O4_MINI,
];

export const DEFAULT_CHAT_MODEL = LLM_MODEL.GPT_4O_MINI;

export const COMMAND_NAME = {
  HELP: 'help',
  CALENDAR: 'calendar',
  TASKS: 'tasks',
} as const;

export const COMMAND_LABEL = {
  [COMMAND_NAME.HELP]: 'Show available commands',
  [COMMAND_NAME.CALENDAR]: 'Create calendar event',
  [COMMAND_NAME.TASKS]: 'Create tasks',
} as const;

export const COMMAND_DESCRIPTION = {
  [COMMAND_NAME.HELP]: 'List the available slash commands.',
  [COMMAND_NAME.CALENDAR]:
    'Parse text/images from the input into a calendar event draft.',
  [COMMAND_NAME.TASKS]:
    'Extract a Google Tasks list from the input text and/or attached images.',
} as const;

export const HELP_HEADING = '**Available commands**';

export const TASKS_PARSING_MESSAGE = 'Parsing tasks...';
export const TASKS_PARSE_ERROR_MESSAGE = 'Failed to parse tasks';
export const TASKS_CREATE_ERROR_MESSAGE = 'Failed to create tasks';
export const TASKS_CREATE_LIST_ERROR_MESSAGE = 'Failed to create task list';
export const TASKS_CANCELLED_MESSAGE = 'Tasks cancelled.';
export const EVENT_PARSING_MESSAGE = 'Parsing event...';
export const EVENT_PARSE_ERROR_MESSAGE = 'Failed to parse event';
export const EVENT_CREATE_ERROR_MESSAGE = 'Failed to create event';
export const EVENT_CANCELLED_MESSAGE = 'Event cancelled.';

export const CHAT_API_PATH = '/api/chat';
export const CALENDAR_PARSE_API_PATH = '/api/calendar/parse';
export const CALENDAR_EVENTS_API_PATH = '/api/calendar/events';
export const TASKS_API_PATH = '/api/tasks';
export const TASKS_LISTS_API_PATH = '/api/tasks/lists';
export const TASKS_PARSE_API_PATH = '/api/tasks/parse-image';

export const SLASH_PREFIX = '/';

export const KEY = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ENTER: 'Enter',
  TAB: 'Tab',
  ESCAPE: 'Escape',
} as const;

export const CHAT_SETTINGS_STORAGE_KEYS = {
  model: 'vb-manager-chat-model',
  useKnowledgeBase: 'vb-manager-chat-use-knowledge-base',
  speakReplies: 'vb-manager-chat-speak-replies',
  voiceId: 'vb-manager-chat-voice-id',
};
