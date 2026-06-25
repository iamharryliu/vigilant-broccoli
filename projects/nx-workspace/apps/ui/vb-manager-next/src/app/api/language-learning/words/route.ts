import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES, LLM_MODEL } from '@vigilant-broccoli/common-js';
import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';
import {
  languageLearningSchema,
  LanguageLearningResult,
} from '@vigilant-broccoli/llm-schemas';
import { getMasteredWords, saveSession } from '../db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a language learning vocabulary assistant.
When given a target language and a semantic category, select one common vocabulary word and one uncommon vocabulary word from that language that both relate to the category.
Choose words that are useful for a learner growing their vocabulary — avoid very basic words (e.g. "hello", "yes", "no", numbers, days of the week).
The common word should be everyday useful vocabulary. The uncommon word should be more advanced or nuanced.
Provide an English definition for each word, then compose one natural example sentence in the target language that uses both words together, along with its English translation.
You will be given a list of previously used words — do not repeat any of them.`;

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

export async function POST(request: NextRequest) {
  const { language = 'Swedish' } = (await request.json()) as {
    language?: string;
  };

  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const masteredWords = getMasteredWords();

  const previousWordsNote =
    masteredWords.length > 0
      ? `\n\nWords the learner has already mastered (do not repeat): ${masteredWords.join(', ')}.`
      : '';

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({
        userPrompt: `Select vocabulary words for learning ${language}. Category: ${category}.${previousWordsNote}`,
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O,
        jsonSchema: languageLearningSchema,
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
    outputs: LanguageLearningResult[];
  };
  const result = outputs[0];

  const session = saveSession(
    language,
    category,
    result.words as { word: string; type: string; definition: string }[],
    result.exampleSentence.target,
    result.exampleSentence.english,
  );

  return NextResponse.json({
    id: session.id,
    language,
    category,
    created_at: session.created_at,
    words: session.words,
    exampleSentence: result.exampleSentence,
  });
}
