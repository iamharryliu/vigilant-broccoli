import { NextRequest, NextResponse } from 'next/server';
import { LLM_MODEL, VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-js';
import { proxyToExpress } from '../../../utils/express.utils';
import { requireAuth } from '../../../../../libs/api-auth';
import { EVERYDAY_WORDS } from '../../../constants/everyday-words';
import {
  LANGUAGE_ORDER,
  WORD_TYPE_ORDER,
  type WordEntry,
  type WordResult,
  type WordType,
} from '../../../constants/language-learning-words';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a vocabulary assistant for a beginner language learner.
You are given one English word or phrase, sometimes with its part of speech; use exactly that word in the sense of that part of speech.
Give the equivalent in English (the word itself), Swedish, French, Spanish and Chinese, and for each language two or three common synonyms (everyday alternatives, also common words).
For Chinese only, fill "pinyin" with Hanyu Pinyin using tone marks; for every other language set "pinyin" to an empty string "".
Also set "type" to the English word's part of speech (noun, adjective, verb or phrase) and "antonym" to its single most common English antonym of the same part of speech (for example "open" and "close", "day" and "night", "please" and "no thanks"), or "" if it has no natural antonym. Do not invent forced antonyms.`;

const languageSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['word', 'pinyin', 'synonyms'],
  properties: {
    word: { type: 'string' },
    pinyin: { type: 'string' },
    synonyms: { type: 'array', items: { type: 'string' } },
  },
} as const;

const WORD_SCHEMA = {
  name: 'everyday_word',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [...LANGUAGE_ORDER, 'type', 'antonym'],
    properties: {
      ...Object.fromEntries(
        LANGUAGE_ORDER.map(language => [language, languageSchema]),
      ),
      type: { type: 'string', enum: WORD_TYPE_ORDER },
      antonym: { type: 'string' },
    },
  },
} as const;

const pickRandom = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

// Picks a type first so the short phrase list is not drowned out by nouns on
// the "All" tab.
const pickWord = (type: WordType | undefined, exclude: string[]) => {
  const seen = new Set(exclude.map(word => word.toLowerCase()));
  const candidateTypes = type ? [type] : WORD_TYPE_ORDER;
  const unseen = (candidate: WordType) =>
    EVERYDAY_WORDS[candidate].filter(word => !seen.has(word.toLowerCase()));

  const typesWithUnseen = candidateTypes.filter(
    candidate => unseen(candidate).length > 0,
  );
  // Every word of the tab has been seen: start over instead of failing.
  const picked = pickRandom(
    typesWithUnseen.length > 0 ? typesWithUnseen : candidateTypes,
  );
  const pool =
    typesWithUnseen.length > 0 ? unseen(picked) : EVERYDAY_WORDS[picked];
  return { word: pickRandom(pool), type: picked };
};

type WordRequest = { type?: WordType; exclude?: string[]; word?: string };

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { type, exclude = [], word } = (await request.json()) as WordRequest;
  const chosen = word
    ? { word, type: undefined }
    : pickWord(
        type && WORD_TYPE_ORDER.includes(type) ? type : undefined,
        exclude,
      );

  const res = await proxyToExpress(VB_EXPRESS_ENDPOINT.LLM, {
    userPrompt: chosen.type
      ? `English word: ${chosen.word} (${chosen.type}).`
      : `English word: ${chosen.word}.`,
    systemPrompt: SYSTEM_PROMPT,
    model: LLM_MODEL.GPT_4O,
    jsonSchema: WORD_SCHEMA,
  });
  if (!res.ok) return res;

  const { outputs } = (await res.json()) as {
    outputs: (WordEntry & { type: WordType; antonym: string })[];
  };
  const { type: llmType, antonym, ...entry } = outputs[0];
  return NextResponse.json({
    entry,
    type: chosen.type ?? llmType,
    antonym,
  } satisfies WordResult);
}
