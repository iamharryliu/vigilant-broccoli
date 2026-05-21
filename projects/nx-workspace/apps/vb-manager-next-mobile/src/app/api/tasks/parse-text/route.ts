import { NextRequest, NextResponse } from 'next/server';
import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ResponseSchema = z.object({ items: z.array(z.string()) });

const SYSTEM_PROMPT = `You are a list extraction assistant. The user will describe what they want a list of.
Extract the items and return a JSON object with an "items" key containing an array of strings.
Example: {"items": ["item 1", "item 2", "item 3"]}`;

export async function POST(request: NextRequest) {
  const { transcript } = await request.json();

  if (!transcript) {
    return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });
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
        userPrompt: transcript,
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O_MINI,
        responseFormat: 'json',
      }),
    },
  );

  const { outputs } = await res.json();
  const validated = ResponseSchema.safeParse(outputs?.[0]);

  if (!validated.success) {
    return NextResponse.json(
      { error: 'Failed to generate list.' },
      { status: 422 },
    );
  }

  return NextResponse.json(validated.data);
}
