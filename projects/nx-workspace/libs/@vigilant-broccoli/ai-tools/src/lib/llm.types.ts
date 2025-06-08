import { AutoParseableResponseFormat } from 'openai/lib/parser.mjs';
import {
  LLMModel,
  LLMModelConfig,
  LLMPrompt,
} from '@vigilant-broccoli/common-js';

export type LLMPromptRequest<T> = {
  prompt: LLMPrompt;
  modelConfig?: LLMModelConfig;
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
