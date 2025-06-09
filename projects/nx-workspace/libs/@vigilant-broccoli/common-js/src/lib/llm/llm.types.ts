import {
  OPENAI_MODEL,
  GEMINI_MODEL,
  DEEPSEEK_MODEL,
  GROK_MODEL,
  LLM_MODEL,
} from './llm.consts';

export type OpenAIModel = (typeof OPENAI_MODEL)[keyof typeof OPENAI_MODEL];
export type GeminiModel = (typeof GEMINI_MODEL)[keyof typeof GEMINI_MODEL];
export type DeepSeekModel =
  (typeof DEEPSEEK_MODEL)[keyof typeof DEEPSEEK_MODEL];
export type GrokModel = (typeof GROK_MODEL)[keyof typeof GROK_MODEL];

export type LLMModel = (typeof LLM_MODEL)[keyof typeof LLM_MODEL];

export type LLMModelConfig = {
  model: LLMModel;
  apiKey?: string;
  max_tokens?: number;
  temperature?: number;
};

export type LLMPrompt = {
  userPrompt: string;
  systemPrompt?: string;
};
