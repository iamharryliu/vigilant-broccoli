import { NextRequest } from 'next/server';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import {
  LLM_MODELS,
  LLMModel,
  LLM_MODEL,
  LLMImage,
} from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface MessageImage {
  data: string;
  mimeType: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: MessageImage[];
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const body = await request.json();
  const { messages, systemPrompt, model } = body as {
    messages: Message[];
    systemPrompt?: string;
    model?: LLMModel;
  };

  if (!messages || messages.length === 0) {
    return new Response('Missing messages', { status: 400 });
  }

  const selectedModel =
    model && LLM_MODELS.includes(model) ? model : LLM_MODEL.GPT_4O;

  const latestUserMessage = messages[messages.length - 1];

  const conversationHistory = messages
    .slice(0, -1)
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  const fullPrompt = conversationHistory
    ? `Previous conversation:\n${conversationHistory}\n\nCurrent question:\n${latestUserMessage.content}`
    : latestUserMessage.content;

  const llmImages: LLMImage[] | undefined = latestUserMessage.images?.map(
    (img, index) => ({
      name: `image_${index}`,
      base64: img.data,
      mimeType: img.mimeType,
    }),
  );

  const now = new Date();
  const currentDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const currentTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const finalSystemPrompt =
    (systemPrompt || 'You are a helpful assistant.') +
    `\n\nCurrent date: ${currentDate}\nCurrent time: ${currentTime}\n\nWhen providing day or week plans, keep them short and concise. Use bullet points and avoid lengthy explanations.`;

  const stream = new ReadableStream({
    async start(controller) {
      const streamResponse = await LLMService.promptStream({
        prompt: {
          userPrompt: fullPrompt,
          systemPrompt: finalSystemPrompt,
          images: llmImages,
        },
        modelConfig: {
          model: selectedModel,
          temperature: 0.7,
        },
      });

      for await (const chunk of streamResponse) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
