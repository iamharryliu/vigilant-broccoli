import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import {
  ANTHROPIC_MODELS,
  AnthropicModel,
  DEEPSEEK_MODELS,
  DeepSeekModel,
  GEMINI_MODELS,
  GeminiModel,
  GROK_MODELS,
  GrokModel,
  LLM_MODEL,
  LLMModel,
  LLMModelConfig,
} from '@vigilant-broccoli/common-js';
import { LLMPromptRequest } from './llm.types';
import Anthropic from '@anthropic-ai/sdk';

const LLM_URL = {
  OPENAI: 'https://api.openai.com/v1',
  DEEPSEEK: 'https://api.deepseek.com',
  GROK: 'https://api.x.ai/v1',
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  ANTHROPIC_API_KEY: 'https://api.anthropic.com/v1/messages',
};

const API_KEY_NAME = {
  OPENAI: 'OPENAI_API_KEY',
  DEEPSEEK: 'DEEPSEEK_API_KEY',
  GROK: 'GROK_API_KEY',
  GEMINI: 'GEMINI_API_KEY',
  ANTHROPIC: 'ANTHROPIC_API_KEY',
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
  if (ANTHROPIC_MODELS.includes(model as AnthropicModel)) {
    return LLM_URL.ANTHROPIC_API_KEY;
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
  if (ANTHROPIC_MODELS.includes(model as AnthropicModel)) {
    return process.env[API_KEY_NAME.ANTHROPIC];
  }
  return process.env[API_KEY_NAME.OPENAI];
}

function getLLMClient(modelConfig: Partial<LLMModelConfig> = {}) {
  if (ANTHROPIC_MODELS.includes(modelConfig?.model as AnthropicModel)) {
    return getAnthropicClient(modelConfig);
  }
  return getOpenAIClient(modelConfig);
}

function getAnthropicClient({
  model = LLM_MODEL.CLAUDE_4_SONNET,
  apiKey,
}: Partial<LLMModelConfig> = {}) {
  return new Anthropic({
    apiKey: apiKey ? apiKey : getModelAPIKey(model),
  });
}

function getOpenAIClient({
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
  const { userPrompt, systemPrompt, images } = prompt;

  let userContent: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;

  if (images && images.length > 0) {
    userContent = [
      {
        type: 'text',
        text: responseFormat?.example
          ? `${userPrompt} ${provideResponseExample(responseFormat.example)}`
          : userPrompt,
      },
      ...images.map(img => ({
        type: 'image_url',
        image_url: {
          url: `data:${img.mimeType};base64,${img.base64}`,
        },
      })),
    ];
  } else {
    userContent = responseFormat?.example
      ? `${userPrompt} ${provideResponseExample(responseFormat.example)}`
      : userPrompt;
  }

  const result = {
    model: LLM_MODEL.GPT_4O,
    ...modelConfig,
    messages: [
      { role: 'system', content: systemPrompt || '' },
      {
        role: 'user',
        content: userContent,
      },
    ],
    ...(responseFormat && responseFormat.zod
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
  getOpenAIClient,
  formatPromptParams,
};
