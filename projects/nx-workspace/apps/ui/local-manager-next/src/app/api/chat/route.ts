import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { HTTP_STATUS_CODES, LLMModel } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  CALENDAR_DRAFT_MARKER,
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
  CHAT_RESPONSE_TYPE,
  CHAT_TOOL_NAME,
} from '../../constants/chatbot.consts';
import {
  KNOWLEDGE_BASE_PREFIX,
  searchKnowledgeBase,
} from '../../../lib/knowledge-base';

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
const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.';
const SYSTEM_PROMPT_SUFFIX =
  '\n\nWhen providing day or week plans, keep them short and concise. Use bullet points and avoid lengthy explanations.';

// text-embedding-3-small scores related text around 0.4-0.7 and unrelated text
// below 0.25, so weaker matches are left out of the prompt.
const KNOWLEDGE_MIN_SIMILARITY = 0.3;
// Recent user turns are searched together so a short follow-up still carries
// its topic.
const KNOWLEDGE_QUERY_MESSAGES = 2;
const KNOWLEDGE_PROMPT_INTRO =
  "\n\nExcerpts from the user's uploaded knowledge base files are below. Use them when they help answer the question, name the file you used, and ignore them when they are unrelated.";

const CALENDAR_INTENT_KEYWORDS = [
  'add to calendar',
  'add to google calendar',
  'create event',
  'create a event',
  'schedule this',
  'put this in my calendar',
  'add this to my calendar',
  'calendar event',
  'create calendar',
];

const CREATE_CALENDAR_EVENT_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: CHAT_TOOL_NAME.CREATE_CALENDAR_EVENT,
    description:
      'Extract calendar event details from the user message. Call this when the user wants to create or add a calendar event.',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Event title',
        },
        description: {
          type: 'string',
          description: 'Event description',
        },
        location: {
          type: 'string',
          description: 'Event location',
        },
        start: {
          type: 'string',
          description: 'Start datetime in ISO 8601 format',
        },
        end: {
          type: 'string',
          description: 'End datetime in ISO 8601 format',
        },
        timeZone: {
          type: 'string',
          description: 'IANA timezone string e.g. Europe/Stockholm',
        },
        allDay: {
          type: 'boolean',
          description: 'Whether this is an all-day event',
        },
        additionalEvents: {
          type: 'array',
          description:
            'Additional events if the message describes multiple recurring occurrences',
          items: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              description: { type: 'string' },
              location: { type: 'string' },
              start: { type: 'string' },
              end: { type: 'string' },
              timeZone: { type: 'string' },
              allDay: { type: 'boolean' },
            },
            required: ['summary', 'start'],
          },
        },
      },
      required: ['summary', 'start'],
    },
  },
};

const hasCalendarIntent = (messages: Message[]): boolean => {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) return false;
  const lower = lastUserMessage.content.toLowerCase();
  if (CALENDAR_INTENT_KEYWORDS.some(keyword => lower.includes(keyword)))
    return true;
  return messages.some(
    m => m.role === 'assistant' && m.content.includes(CALENDAR_DRAFT_MARKER),
  );
};

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
  ...messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => {
      if (m.role === 'user' && m.images?.length) {
        return {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: m.content },
            ...m.images.map(image => ({
              type: 'image_url' as const,
              image_url: { url: `data:${image.mimeType};base64,${image.data}` },
            })),
          ],
        };
      }
      return { role: m.role as 'user' | 'assistant', content: m.content };
    }),
];

const tryCalendarToolCall = async (
  messages: Message[],
  systemPrompt: string,
  model: LLMModel,
): Promise<Response | null> => {
  const openai = new OpenAI({
    apiKey: getEnvironmentVariable('OPENAI_API_KEY'),
  });

  const completion = await openai.chat.completions.create({
    model,
    messages: buildOpenAIMessages(messages, systemPrompt),
    tools: [CREATE_CALENDAR_EVENT_TOOL],
    tool_choice: 'auto',
  });

  const choice = completion.choices[0];
  const toolCall = choice.message.tool_calls?.[0];

  if (
    !toolCall ||
    toolCall.function.name !== CHAT_TOOL_NAME.CREATE_CALENDAR_EVENT
  ) {
    return null;
  }

  const args = JSON.parse(toolCall.function.arguments);
  const { additionalEvents, ...primaryEvent } = args;
  const events = [primaryEvent, ...(additionalEvents ?? [])];

  return new Response(
    JSON.stringify({ type: CHAT_RESPONSE_TYPE.TOOL_CALL, events }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    messages,
    systemPrompt,
    model,
    timeZone,
    useKnowledgeBase = true,
  } = body as {
    messages: Message[];
    systemPrompt?: string;
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
  const selectedModel = model || DEFAULT_CHAT_MODEL;

  const now = new Date();
  const currentDate = now.toLocaleDateString(DATE_LOCALE, DATE_OPTIONS);
  const currentTime = now.toLocaleTimeString(DATE_LOCALE, TIME_OPTIONS);

  const finalSystemPrompt =
    (systemPrompt || DEFAULT_SYSTEM_PROMPT) +
    `\n\nCurrent date: ${currentDate}\nCurrent time: ${currentTime}` +
    (timeZone ? `\nUser timezone: ${timeZone}` : '') +
    SYSTEM_PROMPT_SUFFIX +
    (useKnowledgeBase ? await buildKnowledgeContext(messages) : '');

  if (hasCalendarIntent(messages)) {
    const toolCallResponse = await tryCalendarToolCall(
      messages,
      finalSystemPrompt,
      selectedModel,
    );
    if (toolCallResponse) return toolCallResponse;
  }

  const openai = new OpenAI({
    apiKey: getEnvironmentVariable('OPENAI_API_KEY'),
  });
  const completion = await openai.chat.completions.create(
    {
      model: selectedModel,
      messages: buildOpenAIMessages(messages, finalSystemPrompt),
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
      Connection: 'keep-alive',
    },
  });
}
