import { LLM_MODEL, type LLMModel } from '@vigilant-broccoli/common-js';

export const APP_NAME = 'Chat';
export const APP_DESCRIPTION = 'A private chatbot.';
export const PAGE_TITLE = { HOME: 'Chatbot' } as const;

// No speech-to-text entry: react-lib's useSpeechToText always posts to
// /api/speech-to-text, so that route must keep its path.
export const API_ROUTE = {
  CHAT: '/api/chat',
  TEXT_TO_SPEECH: '/api/text-to-speech',
} as const;

export const TEXT_TO_SPEECH_MAX_CHARS = 5000;

// Model eligibility supplied from the account's complimentary-token allowance;
// mirrors local-manager-next's chatbot.
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

export const STORAGE_KEY = {
  CHATS: 'chat-chats',
  CURRENT_CHAT: 'chat-current',
  SIDEBAR_OPEN: 'chat-sidebar-open',
  MODEL: 'chat-model',
  USE_KNOWLEDGE_BASE: 'chat-use-knowledge-base',
  SPEAK_REPLIES: 'chat-speak-replies',
  VOICE_ID: 'chat-voice-id',
} as const;

export const KEY = {
  ENTER: 'Enter',
} as const;
