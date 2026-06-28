import { NextRequest, NextResponse } from 'next/server';
import {
  API_KEY_HEADER,
  HTTP_HEADERS,
  HTTP_METHOD,
  HTTP_STATUS_CODES,
  LLM_MODEL,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a language learning assistant. Given a word in a target language, return a brief one-sentence English definition suitable for a language learner. For Chinese only, fill the "pinyin" field with the Hanyu Pinyin transcription using tone marks (e.g. "píngguǒ"). For every other language, set "pinyin" to an empty string "".`;

const DEFINE_SCHEMA = {
  name: 'word_definition',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['definition', 'pinyin'],
    properties: {
      definition: { type: 'string' },
      pinyin: { type: 'string' },
    },
  },
} as const;

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
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        [API_KEY_HEADER]: getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({
        userPrompt: `Define the ${language} word "${word}" in English for a language learner.`,
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O_MINI,
        jsonSchema: DEFINE_SCHEMA,
      }),
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to get definition' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { outputs } = (await res.json()) as {
    outputs: { definition: string; pinyin: string }[];
  };
  const result = outputs[0];
  return NextResponse.json({
    definition: result.definition,
    pinyin: result.pinyin || undefined,
  });
}
