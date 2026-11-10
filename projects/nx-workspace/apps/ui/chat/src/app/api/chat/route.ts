import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { HTTP_STATUS_CODES, type LLMModel } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { CHAT_MODELS, DEFAULT_CHAT_MODEL } from '../../app.const';
import type { Message } from '../../chat.types';
import {
  KNOWLEDGE_BASE_PREFIX,
  searchKnowledgeBase,
} from '../../../lib/knowledge-base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATE_LOCALE = 'en-US';
const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};
const TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};
const SYSTEM_PROMPT =
  'You are a helpful assistant. When providing day or week plans, keep them short and concise. Use bullet points and avoid lengthy explanations.';

// text-embedding-3-small scores related text around 0.4-0.7 and unrelated text
// below 0.25, so weaker matches are left out of the prompt.
const KNOWLEDGE_MIN_SIMILARITY = 0.3;
// Recent user turns are searched together so a short follow-up still carries
// its topic.
const KNOWLEDGE_QUERY_MESSAGES = 2;
const KNOWLEDGE_PROMPT_INTRO =
  "\n\nExcerpts from the user's uploaded knowledge base files are below. Use them when they help answer the question, name the file you used, and ignore them when they are unrelated.";

// Retrieval is best-effort: a failed search must not stop the chat answering.
const buildKnowledgeContext = async (messages: Message[]) => {
  const query = messages
    .filter(m => m.role === 'user')
    .slice(-KNOWLEDGE_QUERY_MESSAGES)
    .map(m => m.content)
    .join('\n')
    .trim();
  if (!query) return '';
  try {
    const excerpts = (await searchKnowledgeBase(query))
      .filter(match => match.similarity >= KNOWLEDGE_MIN_SIMILARITY)
      .map(
        match =>
          `[${match.file_key.slice(KNOWLEDGE_BASE_PREFIX.length + 1)}]\n${match.content}`,
      );
    return excerpts.length > 0
      ? `${KNOWLEDGE_PROMPT_INTRO}\n\n${excerpts.join('\n\n')}`
      : '';
  } catch {
    return '';
  }
};

const buildOpenAIMessages = (
  messages: Message[],
  systemPrompt: string,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => [
  { role: 'system', content: systemPrompt },
  ...messages.map(m =>
    m.role === 'user' && m.images?.length
      ? {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: m.content },
            ...m.images.map(image => ({
              type: 'image_url' as const,
              image_url: { url: `data:${image.mimeType};base64,${image.data}` },
            })),
          ],
        }
      : { role: m.role, content: m.content },
  ),
];

// Vercel Authentication gates every path, including this route, so only the
// signed-in owner reaches it.
export async function POST(request: NextRequest) {
  const {
    messages,
    model,
    timeZone,
    useKnowledgeBase = true,
  } = (await request.json()) as {
    messages?: Message[];
    model?: LLMModel;
    timeZone?: string;
    useKnowledgeBase?: boolean;
  };

  if (!messages || messages.length === 0) {
    return new Response('Missing messages', {
      status: HTTP_STATUS_CODES.BAD_REQUEST,
    });
  }
  if (model && !CHAT_MODELS.includes(model)) {
    return new Response('Unsupported chatbot model', {
      status: HTTP_STATUS_CODES.BAD_REQUEST,
    });
  }

  const now = new Date();
  const systemPrompt =
    `${SYSTEM_PROMPT}\n\nCurrent date: ${now.toLocaleDateString(DATE_LOCALE, DATE_OPTIONS)}` +
    `\nCurrent time: ${now.toLocaleTimeString(DATE_LOCALE, TIME_OPTIONS)}` +
    (timeZone ? `\nUser timezone: ${timeZone}` : '') +
    (useKnowledgeBase ? await buildKnowledgeContext(messages) : '');

  const openai = new OpenAI({
    apiKey: getEnvironmentVariable('OPENAI_API_KEY'),
  });
  const completion = await openai.chat.completions.create(
    {
      model: model || DEFAULT_CHAT_MODEL,
      messages: buildOpenAIMessages(messages, systemPrompt),
      stream: true,
    },
    { signal: request.signal },
  );
  const iterator = completion[Symbol.asyncIterator]();
  const encoder = new TextEncoder();
  let cancelled = false;
  const bodyStream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (!cancelled) {
          const { done, value } = await iterator.next();
          if (cancelled) return;
          if (done) {
            controller.close();
            return;
          }
          const content = value.choices[0]?.delta.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
            return;
          }
        }
      } catch (error) {
        if (!cancelled) controller.error(error);
      }
    },
    cancel() {
      cancelled = true;
      completion.controller.abort();
    },
  });

  return new Response(bodyStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
