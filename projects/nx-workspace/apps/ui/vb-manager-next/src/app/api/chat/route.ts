import { NextRequest } from 'next/server';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const body = await request.json();
  const { messages, systemPrompt } = body as {
    messages: Message[];
    systemPrompt?: string;
  };

  if (!messages || messages.length === 0) {
    return new Response('Missing messages', { status: 400 });
  }

  const latestUserMessage = messages[messages.length - 1];

  const conversationHistory = messages
    .slice(0, -1)
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  const fullPrompt = conversationHistory
    ? `Previous conversation:\n${conversationHistory}\n\nCurrent question:\n${latestUserMessage.content}`
    : latestUserMessage.content;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const finalSystemPrompt =
    (systemPrompt || 'You are a helpful assistant.') +
    `\n\nCurrent date: ${currentDate}\n\nWhen providing day or week plans, keep them short and concise. Use bullet points and avoid lengthy explanations.`;

  const stream = new ReadableStream({
    async start(controller) {
      const streamResponse = await LLMService.promptStream({
        prompt: {
          userPrompt: fullPrompt,
          systemPrompt: finalSystemPrompt,
        },
        modelConfig: {
          model: LLM_MODEL.GPT_4O,
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
