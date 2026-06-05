import {
  LLMJsonSchema,
  LLMModel,
  LLMModelConfig,
  LLMPrompt,
} from '@vigilant-broccoli/common-js';

export type LLMResponseFormat = {
  example?: string;
  jsonSchema?: LLMJsonSchema;
};

export type LLMPromptRequest = {
  prompt: LLMPrompt;
  modelConfig?: LLMModelConfig;
  responseFormat?: LLMResponseFormat;
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
