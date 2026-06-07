import { NextRequest } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';
import { LLM_MODEL, LLM_MODELS, LLMModel } from '@vigilant-broccoli/common-js';

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

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { messages, systemPrompt, model } = body as {
    messages: Message[];
    systemPrompt?: string;
    model?: LLMModel;
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
    SYSTEM_PROMPT_SUFFIX;

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
