export const OPENAI_MODEL = {
  GPT_4: 'gpt-4',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  O3_MINI: 'o3-mini',
  IMAGE_1: 'gpt-image-1',
} as const;
export const OPEN_AI_MODELS = Object.values(OPENAI_MODEL);

export const GEMINI_MODEL = {
  FLASH_2_5: 'gemini-2.5-flash',
  FLASH_2_5_LITE: 'gemini-2.5-flash-lite',
} as const;
export const GEMINI_MODELS = Object.values(GEMINI_MODEL);

export const ANTHROPIC_MODEL = {
  CLAUDE_4_SONNET: 'claude-sonnet-4-20250514',
  CLAUDE_4_OPUS: 'claude-opus-4-20250514',
} as const;
export const ANTHROPIC_MODELS = Object.values(ANTHROPIC_MODEL);

export const DEEPSEEK_MODEL = {
  DEEP_SEEK: 'deepseek-chat',
  DEEP_SEEK_REASONER: 'deepseek-reasoner',
} as const;
export const DEEPSEEK_MODELS = Object.values(DEEPSEEK_MODEL);

export const GROK_MODEL = {
  GROK_3: 'grok-3',
  GROK_3_MINI: 'grok-3-mini',
  GROK_VISION_LATEST: 'grok-2-vision',
} as const;
export const GROK_MODELS = Object.values(GROK_MODEL);

export const LLM_MODEL = {
  ...OPENAI_MODEL,
  ...GEMINI_MODEL,
  ...DEEPSEEK_MODEL,
  ...GROK_MODEL,
  ...ANTHROPIC_MODEL,
} as const;
export const LLM_MODELS = Object.values(LLM_MODEL);
