import {
  LLMJsonSchema,
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
    jsonSchema?: LLMJsonSchema;
  };
};

export type LLMPromptResult<T = string> = {
  data: T;
  model: LLMModel;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
};
