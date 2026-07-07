import { getVbExpressApiKey } from '../../../../lib/vb-express';
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
import {
  languageLearningMultiSchema,
  LanguageLearningMultiResult,
} from '@vigilant-broccoli/llm-schemas';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { getMasteredWords, saveSession } from '../db';

const getUserEmail = async (): Promise<string | null> => {
  const session = await getServerSession(authOptions);
  return session?.userEmail ?? session?.user?.email ?? null;
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a language learning vocabulary assistant.
When given a list of target languages and a semantic category, first choose one common concept and one uncommon concept that both relate to the category — pick concepts that are useful for a learner growing their vocabulary (avoid very basic words like "hello", "yes", "no", numbers, days of the week). The common concept should be everyday useful vocabulary; the uncommon concept should be more advanced or nuanced.
Then, for each target language, provide the equivalent word for both concepts (with an English definition for each) and compose one natural example sentence in that language that uses both words together, along with its English translation.
The same two concepts must be used across every language so the words stay equivalent. Only omit a language from the output if there is genuinely no usable word for a concept in that language — do not omit a language just because the translation is imperfect or the word is a loanword.
For Chinese only, fill the "pinyin" field on each word and on the example sentence with the Hanyu Pinyin transcription using tone marks (e.g. "píngguǒ", "wǒ chī le yī gè píngguǒ"). For every other language, set "pinyin" to an empty string "".
You will be given a list of previously used words — do not reuse any of them.`;

const CATEGORIES = [
  'emotions and feelings',
  'nature and weather',
  'food and cooking',
  'travel and movement',
  'work and profession',
  'relationships and social life',
  'health and body',
  'time and planning',
  'home and living spaces',
  'shopping and money',
  'art and creativity',
  'technology and media',
  'sports and leisure',
  'personality traits',
  'clothing and appearance',
  'animals and plants',
  'city and urban life',
  'learning and knowledge',
  'conflict and resolution',
  'values and beliefs',
];

const DEFAULT_LANGUAGES = ['Swedish'];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export async function POST(request: NextRequest) {
  const userEmail = await getUserEmail();
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { languages } = (await request.json()) as {
    languages?: string[];
  };

  const targetLanguages =
    languages && languages.length > 0 ? languages : DEFAULT_LANGUAGES;

  const category = pickRandom(CATEGORIES);
  const masteredWords = await getMasteredWords(userEmail);

  const previousWordsNote =
    masteredWords.length > 0
      ? `\n\nWords the learner has already mastered (do not repeat): ${masteredWords.join(', ')}.`
      : '';

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
        [API_KEY_HEADER]: getVbExpressApiKey(),
      },
      body: JSON.stringify({
        userPrompt: `Select vocabulary words for learning these languages: ${targetLanguages.join(', ')}. Category: ${category}.${previousWordsNote}`,
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O,
        jsonSchema: languageLearningMultiSchema,
      }),
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Failed to generate vocabulary' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { outputs } = (await res.json()) as {
    outputs: LanguageLearningMultiResult[];
  };
  const result = outputs[0];

  const sessions = await Promise.all(
    result.languages.map(async entry => {
      const session = await saveSession(
        userEmail,
        entry.language,
        category,
        entry.words.map(w => ({
          word: w.word,
          type: w.type,
          definition: w.definition,
          pinyin: w.pinyin || undefined,
        })),
        entry.exampleSentence.target,
        entry.exampleSentence.english,
        entry.exampleSentence.pinyin || undefined,
      );
      return {
        id: session.id,
        language: entry.language,
        category,
        created_at: session.created_at,
        words: session.words,
        exampleSentence: {
          target: entry.exampleSentence.target,
          english: entry.exampleSentence.english,
          pinyin: session.example_pinyin ?? undefined,
        },
      };
    }),
  );

  return NextResponse.json({ sessions });
}
