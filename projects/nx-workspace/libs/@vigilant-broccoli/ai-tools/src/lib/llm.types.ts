import {
  DEEPSEEK_MODEL,
  GEMINI_MODEL,
  GROK_MODEL,
  OPENAI_MODEL,
} from './llm.consts';
import { AutoParseableResponseFormat } from 'openai/lib/parser.mjs';
import { LLM_MODEL } from '../lib/llm.consts';

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

export type LLMPromptRequest<T> = {
  prompt: {
    userPrompt: string;
    systemPrompt?: string;
  };
  modelConfig: LLMModelConfig;
  responseFormat?: {
    example?: string;
    zod: AutoParseableResponseFormat<T>;
  };
};

export type LLMPromptResult<T = string> = {
  data: T;
  // meta?
  model: LLMModel;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
};
