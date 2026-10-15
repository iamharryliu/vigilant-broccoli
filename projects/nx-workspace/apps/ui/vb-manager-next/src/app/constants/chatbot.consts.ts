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
