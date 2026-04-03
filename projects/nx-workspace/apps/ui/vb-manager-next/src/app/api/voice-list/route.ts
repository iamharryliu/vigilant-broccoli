import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are a list extraction assistant. The user will describe what they want a list of.
Extract the items and return a JSON object with an "items" key containing an array of strings.
Example: {"items": ["item 1", "item 2", "item 3"]}`;

const itemsSchema = z.object({ items: z.array(z.string()) });

export async function POST(request: NextRequest) {
  const { transcript } = await request.json();

  if (!transcript) {
    return NextResponse.json(
      { error: 'Missing transcript' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const result = await LLMService.prompt<{ items: string[] }>({
    prompt: {
      userPrompt: transcript,
      systemPrompt: SYSTEM_PROMPT,
    },
    modelConfig: { model: LLM_MODEL.GPT_4O_MINI, temperature: 0.3 },
    responseFormat: { zod: itemsSchema },
  });

  return NextResponse.json({ items: result.data.items });
}
