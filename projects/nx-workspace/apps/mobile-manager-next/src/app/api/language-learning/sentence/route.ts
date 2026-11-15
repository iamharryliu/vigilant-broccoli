import { NextRequest, NextResponse } from 'next/server';
import { LLM_MODEL, VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-js';
import { proxyToExpress } from '../../../utils/express.utils';
import { requireAuth } from '../../../../../libs/api-auth';
import {
  LANGUAGE_ORDER,
  type Language,
  type SentenceResult,
} from '../../../constants/language-learning-words';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You write example sentences for a beginner language learner.
Write one short, natural, everyday sentence (at most 12 words) in the requested language that uses the given word, so the learner sees how it is used. Vary the situation each time; use simple vocabulary.
Also give its English translation (for English, repeat the sentence). For Chinese only, fill "pinyin" with Hanyu Pinyin using tone marks; otherwise set "pinyin" to an empty string "".`;

const SENTENCE_SCHEMA = {
  name: 'example_sentence',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['sentence', 'english', 'pinyin'],
    properties: {
      sentence: { type: 'string' },
      english: { type: 'string' },
      pinyin: { type: 'string' },
    },
  },
} as const;

type SentenceRequest = { language?: Language; word?: string };

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { language, word } = (await request.json()) as SentenceRequest;
  if (!language || !word || !LANGUAGE_ORDER.includes(language)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const res = await proxyToExpress(VB_EXPRESS_ENDPOINT.LLM, {
    userPrompt: `Language: ${language}. Word: ${word}.`,
    systemPrompt: SYSTEM_PROMPT,
    model: LLM_MODEL.GPT_4O_MINI,
    jsonSchema: SENTENCE_SCHEMA,
  });
  if (!res.ok) return res;

  const { outputs } = (await res.json()) as { outputs: SentenceResult[] };
  return NextResponse.json(outputs[0]);
}
