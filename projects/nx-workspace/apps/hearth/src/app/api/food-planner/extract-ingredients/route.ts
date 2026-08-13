import { getVbExpressApiKey } from '../../../../lib/vb-express';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  ANTHROPIC_MODEL,
  HTTP_STATUS_CODES,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RECIPE_SEPARATOR = '\n\n---\n\n';

const SYSTEM_PROMPT =
  'You are a kitchen assistant. Extract a consolidated shopping list from the ' +
  'provided recipe markdown. Combine duplicate ingredients across recipes and ' +
  'sum their quantities where possible. Return each item as a concise grocery ' +
  'line including quantity and unit, e.g. "500g lean pork". Exclude salt, ' +
  'pepper and water.';

const INGREDIENTS_SCHEMA = {
  name: 'grocery_ingredients',
  schema: {
    type: 'object',
    properties: {
      ingredients: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['ingredients'],
    additionalProperties: false,
  },
};

const INGREDIENTS_HEADING = /^#{1,6}\s*ingredients\s*$/i;
const SECTION_HEADING = /^#{1,6}\s/;
const BULLET_PREFIX = /^[-*]\s+/;

const parseIngredientsFromMarkdown = (markdowns: string[]): string[] => {
  const seen = new Set<string>();
  for (const markdown of markdowns) {
    let inSection = false;
    for (const raw of markdown.split('\n')) {
      const line = raw.trim();
      if (INGREDIENTS_HEADING.test(line)) {
        inSection = true;
        continue;
      }
      if (inSection && SECTION_HEADING.test(line)) {
        inSection = false;
        continue;
      }
      if (inSection && BULLET_PREFIX.test(line)) {
        seen.add(line.replace(BULLET_PREFIX, '').trim());
      }
    }
  }
  return [...seen];
};

const extractWithLlm = async (markdowns: string[]): Promise<string[]> => {
  const vbExpressUrl = getEnvironmentVariable('VB_EXPRESS_URL');
  if (!vbExpressUrl) return parseIngredientsFromMarkdown(markdowns);

  const res = await fetch(`${vbExpressUrl}/${VB_EXPRESS_ENDPOINT.LLM}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getVbExpressApiKey(),
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL.CLAUDE_4_HAIKU,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: markdowns.join(RECIPE_SEPARATOR),
      jsonSchema: INGREDIENTS_SCHEMA,
    }),
  });

  if (!res.ok) {
    console.warn(`extract-ingredients LLM ${res.status}, using fallback parse`);
    return parseIngredientsFromMarkdown(markdowns);
  }

  const { outputs } = await res.json();
  const ingredients = outputs?.[0]?.ingredients;
  return Array.isArray(ingredients)
    ? ingredients
    : parseIngredientsFromMarkdown(markdowns);
};

const RequestSchema = z.object({
  markdowns: z.array(z.string().min(1)).min(1),
});

export async function POST(request: NextRequest) {
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const {
    data: { user },
  } = await createServerClient(accessToken).auth.getUser();
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const ingredients = await extractWithLlm(parsed.data.markdowns);
  return Response.json({ ingredients });
}
