import {
  LLMModel,
  LLMModelConfig,
  LLMPrompt,
} from '@vigilant-broccoli/common-js';
import { ZodType } from 'zod';

export type LLMPromptRequest<T> = {
  prompt: LLMPrompt;
  modelConfig?: LLMModelConfig;
  responseFormat?: {
    example?: string;
    zod?: ZodType<T>;
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
