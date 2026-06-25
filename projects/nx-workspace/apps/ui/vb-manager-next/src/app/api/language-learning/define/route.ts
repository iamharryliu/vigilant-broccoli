import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES, LLM_MODEL } from '@vigilant-broccoli/common-js';
import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a language learning assistant. Given a word in a target language, provide a brief English definition suitable for a language learner. Be concise — one sentence maximum.`;

export async function POST(request: NextRequest) {
  const { word, language } = (await request.json()) as {
    word: string;
    language: string;
  };

  if (!word || !language) {
    return NextResponse.json(
      { error: 'Missing word or language' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({
        userPrompt: `Define the ${language} word "${word}" in English for a language learner.`,
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O_MINI,
      }),
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to get definition' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { outputs } = (await res.json()) as { outputs: string[] };
  return NextResponse.json({ definition: outputs[0] });
}
