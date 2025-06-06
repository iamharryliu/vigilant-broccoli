import OpenAI from 'openai';
import {
  DEEPSEEK_MODELS,
  GEMINI_MODELS,
  GROK_MODELS,
  LLM_MODEL,
} from './llm.consts';
import {
  GeminiModel,
  DeepSeekModel,
  GrokModel,
  LLMModel,
  LLMPromptRequest,
  LLMModelConfig,
} from './llm.types';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

const LLM_URL = {
  OPENAI: 'https://api.openai.com/v1',
  DEEPSEEK: 'https://api.deepseek.com',
  GROK: 'https://api.x.ai/v1',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/openai/',
};

const API_KEY_NAME = {
  OPENAI: 'OPENAI_API_KEY',
  DEEPSEEK: 'DEEPSEEK_API_KEY',
  GROK: 'GROK_API_KEY',
  GEMINI: 'GEMINI_API_KEY',
};

function getModelBaseUrl(model: LLMModel) {
  if (GEMINI_MODELS.includes(model as GeminiModel)) {
    return LLM_URL.GEMINI;
  }
  if (DEEPSEEK_MODELS.includes(model as DeepSeekModel)) {
    return LLM_URL.DEEPSEEK;
  }
  if (GROK_MODELS.includes(model as GrokModel)) {
    return LLM_URL.GROK;
  }
  return LLM_URL.OPENAI;
}

function getModelAPIKey(model: LLMModel) {
  if (GEMINI_MODELS.includes(model as GeminiModel)) {
    return process.env[API_KEY_NAME.GEMINI];
  }
  if (DEEPSEEK_MODELS.includes(model as DeepSeekModel)) {
    return process.env[API_KEY_NAME.DEEPSEEK];
  }
  if (GROK_MODELS.includes(model as GrokModel)) {
    return process.env[API_KEY_NAME.GROK];
  }
  return process.env[API_KEY_NAME.OPENAI];
}

function getLLMClient({
  model = LLM_MODEL.GPT_4O,
  apiKey,
}: Partial<LLMModelConfig> = {}) {
  return new OpenAI({
    baseURL: getModelBaseUrl(model),
    apiKey: apiKey ? apiKey : getModelAPIKey(model),
  });
}

function formatPromptParams<T>(request: LLMPromptRequest<T>) {
  const { prompt, modelConfig, responseFormat } = request;
  const { userPrompt, systemPrompt } = prompt;
  const result = {
    model: LLM_MODEL.GPT_4O,
    ...modelConfig,
    messages: [
      { role: 'system', content: systemPrompt || '' },
      {
        role: 'user',
        content: responseFormat?.example
          ? `${userPrompt} ${provideResponseExample(responseFormat.example)}`
          : userPrompt,
      },
    ],
    ...(responseFormat
      ? { response_format: zodResponseFormat(responseFormat.zod, 'answer') }
      : {}),
  } as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming;
  return result;
}

function provideResponseExample(responseExample: string) {
  return `Response Example: ${responseExample}`;
}

export const LLMUtils = {
  getLLMClient,
  formatPromptParams,
};
