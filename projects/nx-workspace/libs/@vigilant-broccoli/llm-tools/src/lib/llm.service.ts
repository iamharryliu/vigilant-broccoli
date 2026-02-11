import OpenAI, { toFile } from 'openai';
import { LLMPromptRequest, LLMPromptResult } from './llm.types';
import { LLMUtils } from './llm.utils';
import * as fs from 'fs';
import { CompletionUsage } from 'openai/resources/completions';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import Anthropic from '@anthropic-ai/sdk';

function buildAnthropicContent(request: LLMPromptRequest<unknown>) {
  const { prompt: promptData } = request;
  const content: Anthropic.MessageParam['content'] = [
    {
      type: 'text',
      text: promptData.userPrompt,
    },
  ];

  if (promptData.images && promptData.images.length > 0) {
    promptData.images.forEach(img => {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mimeType as
            | 'image/jpeg'
            | 'image/png'
            | 'image/gif'
            | 'image/webp',
          data: img.base64,
        },
      });
    });
  }

  return content;
}

function parseAnthropicResponse<T>(
  msg: Anthropic.Message,
  responseFormat?: { example?: string; zod?: unknown },
): T | string {
  const textContent = msg.content[0] as Anthropic.TextBlock;
  return responseFormat ? JSON.parse(textContent.text) : textContent.text;
}

async function promptAnthropic<T>(
  request: LLMPromptRequest<T>,
): Promise<LLMPromptResult<T>> {
  const { modelConfig, responseFormat, prompt: promptData } = request;
  const client = LLMUtils.getLLMClient(modelConfig) as Anthropic;

  const msg = await client.messages.create({
    model: modelConfig?.model || LLM_MODEL.CLAUDE_4_SONNET,
    max_tokens: modelConfig?.max_tokens || 20000,
    temperature: modelConfig?.temperature || 1,
    stream: false,
    system: promptData.systemPrompt || '',
    messages: [
      {
        role: 'user',
        content: buildAnthropicContent(request),
      },
    ],
  });

  const { input_tokens, output_tokens } = msg.usage;
  return {
    model: modelConfig?.model || LLM_MODEL.CLAUDE_4_SONNET,
    tokens: {
      prompt: input_tokens,
      completion: output_tokens,
      total: input_tokens + output_tokens,
    },
    data: parseAnthropicResponse<T>(msg, responseFormat) as T,
  };
}

async function promptOpenAI<T>(
  request: LLMPromptRequest<T>,
): Promise<LLMPromptResult<T>> {
  const { modelConfig, responseFormat } = request;
  const client = LLMUtils.getLLMClient(modelConfig) as OpenAI;
  const chatParams = LLMUtils.formatPromptParams(request, false);

  const response = (await client.chat.completions.create(
    chatParams,
  )) as OpenAI.Chat.Completions.ChatCompletion;
  const usage = response.usage as CompletionUsage;
  const message = response.choices[0].message;

  if (!message.content || !message.content.length) {
    throw new Error('LLM returned no content.');
  }

  return {
    model: modelConfig?.model || LLM_MODEL.GPT_4O,
    tokens: {
      prompt: usage.prompt_tokens,
      completion: usage.completion_tokens,
      total: usage.total_tokens,
    },
    data: responseFormat ? JSON.parse(message.content) : message.content,
  };
}

async function promptOpenAIStream<T>(
  request: LLMPromptRequest<T>,
): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  const { modelConfig } = request;
  const client = LLMUtils.getLLMClient(modelConfig) as OpenAI;
  const chatParams = LLMUtils.formatPromptParams(request, true);

  const streamResponse = await client.chat.completions.create(chatParams);
  return streamResponse as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
}

async function prompt<T>(
  request: LLMPromptRequest<T>,
): Promise<LLMPromptResult<T>> {
  const { modelConfig } = request;
  const client = LLMUtils.getLLMClient(modelConfig);

  if (client instanceof Anthropic) {
    return promptAnthropic(request);
  }

  return promptOpenAI(request);
}

async function promptStream<T>(
  request: LLMPromptRequest<T>,
): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  const { modelConfig } = request;
  const client = LLMUtils.getLLMClient(modelConfig);

  if (client instanceof Anthropic) {
    throw new Error('Streaming is not yet supported for Anthropic models');
  }

  return promptOpenAIStream(request);
}

async function generateImages(prompt: string, n = 1) {
  const client = LLMUtils.getOpenAIClient({ model: LLM_MODEL.IMAGE_1 });
  const response = await client.images.generate({
    model: LLM_MODEL.IMAGE_1,
    prompt,
    n,
    size: 'auto',
  });
  if (!response.data || !response.data.length)
    throw new Error('LLM returned no data.');
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
  if (!response.data || !response.data.length)
    throw new Error('LLM returned no data.');
  return `data:image/png;base64,${response.data[0].b64_json}`;
}

async function generateMultipleOutputs<T>(
  request: LLMPromptRequest<T>,
  numOutputs: number,
  isImageModel: boolean,
): Promise<string[]> {
  if (isImageModel) {
    const imageResults = await generateImages(
      request.prompt.userPrompt,
      numOutputs,
    );
    return imageResults.filter((img): img is string => img !== undefined);
  }

  const outputs = await Promise.all(
    Array.from({ length: numOutputs }, async () => {
      const result = (await prompt(request)) as LLMPromptResult<T>;
      return result.data as string;
    }),
  );
  return outputs;
}

export const LLMService = {
  prompt,
  promptStream,
  generateImage,
  generateImages,
  editImage,
  generateMultipleOutputs,
};
