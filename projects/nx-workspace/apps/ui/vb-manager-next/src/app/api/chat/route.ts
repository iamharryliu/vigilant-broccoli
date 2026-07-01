import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import {
  HTTP_STATUS_CODES,
  LLM_MODEL,
  LLM_MODELS,
  LLMModel,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  CALENDAR_DRAFT_MARKER,
  CHAT_RESPONSE_TYPE,
  CHAT_TOOL_NAME,
} from '../../constants/chatbot.consts';

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

const buildOpenAIMessages = (
  messages: Message[],
  systemPrompt: string,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => [
  { role: 'system', content: systemPrompt },
  ...messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
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
  const { messages, systemPrompt, model, timeZone } = body as {
    messages: Message[];
    systemPrompt?: string;
    model?: LLMModel;
    timeZone?: string;
  };

  if (!messages || messages.length === 0) {
    return new Response('Missing messages', {
      status: HTTP_STATUS_CODES.BAD_REQUEST,
    });
  }

  const selectedModel =
    model && LLM_MODELS.includes(model) ? model : LLM_MODEL.GPT_4O;

  const now = new Date();
  const currentDate = now.toLocaleDateString(DATE_LOCALE, DATE_OPTIONS);
  const currentTime = now.toLocaleTimeString(DATE_LOCALE, TIME_OPTIONS);

  const finalSystemPrompt =
    (systemPrompt || DEFAULT_SYSTEM_PROMPT) +
    `\n\nCurrent date: ${currentDate}\nCurrent time: ${currentTime}` +
    (timeZone ? `\nUser timezone: ${timeZone}` : '') +
    SYSTEM_PROMPT_SUFFIX;

  if (hasCalendarIntent(messages)) {
    const toolCallResponse = await tryCalendarToolCall(
      messages,
      finalSystemPrompt,
      selectedModel,
    );
    if (toolCallResponse) return toolCallResponse;
  }

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.CHAT}`,
    {
      method: 'POST',
      headers: {
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        systemPrompt: finalSystemPrompt,
        model: selectedModel,
      }),
    },
  );

  return new Response(res.body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
