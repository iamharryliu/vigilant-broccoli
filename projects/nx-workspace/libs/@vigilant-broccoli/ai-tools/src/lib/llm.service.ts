import { toFile } from 'openai';
import { LLMPromptRequest, LLMPromptResult } from './llm.types';
import { LLMUtils } from './llm.utils';
import * as fs from 'fs';
import { CompletionUsage } from 'openai/resources/completions';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import Anthropic from '@anthropic-ai/sdk';

async function prompt<T>(
  request: LLMPromptRequest,
): Promise<LLMPromptResult<T>> {
  const { modelConfig, responseFormat } = request;
  const client = LLMUtils.getLLMClient(modelConfig);
  const chatParams = LLMUtils.formatPromptParams(request);
  if (client instanceof Anthropic) {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 20000,
      temperature: 1,
      stream: false,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Who is the prime minister of Canada?',
            },
          ],
        },
      ],
    });

    const usage = msg.usage;
    const { input_tokens, output_tokens } = usage;
    return {
      model: modelConfig?.model || LLM_MODEL.GPT_4O,
      tokens: {
        prompt: input_tokens,
        completion: output_tokens,
        total: input_tokens + output_tokens,
      },
      data: responseFormat
        ? JSON.parse((msg.content[0] as { type: 'text'; text: string }).text)
        : (msg.content[0] as { type: 'text'; text: string }).text,
    };
  }

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

async function generateImages(prompt: string, n = 1) {
  const client = LLMUtils.getOpenAIClient({ model: LLM_MODEL.IMAGE_1 });
  const response = await client.images.generate({
    model: LLM_MODEL.IMAGE_1,
    prompt,
    n,
    size: 'auto',
  });
  return response.data.map(data => data.b64_json);
}

async function generateImage(prompt: string) {
  const [image] = await generateImages(prompt, 1);
  return image as string;
}

async function editImage(filenames: string[], prompt: string) {
  const images = await Promise.all(
    filenames.map(
      async file =>
        await toFile(fs.createReadStream(file), null, {
          type: 'image/png',
        }),
    ),
  );
  const client = LLMUtils.getOpenAIClient({ model: LLM_MODEL.IMAGE_1 });
  const response = await client.images.edit({
    model: 'gpt-image-1',
    image: images,
    prompt,
  });
  return `data:image/png;base64,${response.data[0].b64_json}`;
}

export const LLMService = {
  prompt,
  generateImage,
  generateImages,
  editImage,
};
