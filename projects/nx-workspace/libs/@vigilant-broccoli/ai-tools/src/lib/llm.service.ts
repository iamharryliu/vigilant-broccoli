import { toFile } from 'openai';
import { LLMPromptRequest, LLMPromptResult } from './llm.types';
import { LLMUtils } from './llm.utils';
import { createReadStream } from 'fs';
import { CompletionUsage } from 'openai/resources/completions';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';

async function prompt<T>(
  request: LLMPromptRequest<T>,
): Promise<LLMPromptResult<T>> {
  const { modelConfig, responseFormat } = request;
  const client = LLMUtils.getLLMClient(modelConfig);
  const chatParams = LLMUtils.formatPromptParams(request);
  const response = await client.chat.completions.create(chatParams);

  const usage = response.usage as CompletionUsage;
  const { total_tokens, prompt_tokens, completion_tokens } = usage;
  const message = response.choices[0].message;

  return {
    model: modelConfig?.model || LLM_MODEL.GPT_4O,
    tokens: {
      prompt: prompt_tokens,
      completion: completion_tokens,
      total: total_tokens,
    },
    data: responseFormat ? JSON.parse(message.content) : message.content,
  };
}

async function generateImage(prompt: string) {
  const client = LLMUtils.getLLMClient({ model: LLM_MODEL.IMAGE_1 });
  const response = await client.images.generate({
    model: LLM_MODEL.IMAGE_1,
    prompt,
    n: 1,
    size: '1024x1024',
  });
  return `data:image/png;base64,${response.data[0].b64_json}`;
}

async function editImage(filename: string, prompt: string) {
  const image = await toFile(createReadStream(filename), null, {
    type: 'image/png',
  });
  const client = LLMUtils.getLLMClient({ model: LLM_MODEL.IMAGE_1 });
  const response = await client.images.edit({
    model: 'gpt-image-1',
    image,
    prompt,
  });
  return `data:image/png;base64,${response.data[0].b64_json}`;
}

export const LLMService = {
  prompt,
  generateImage,
  editImage,
};
