import { NextRequest, NextResponse } from 'next/server';
import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import { z } from 'zod';

export const runtime = 'nodejs';

const RequestSchema = z.object({
  images: z
    .array(z.object({ base64: z.string(), mimeType: z.string() }))
    .min(1),
});

const ResponseSchema = z.object({ items: z.array(z.string()) });

const SYSTEM_PROMPT = `You are a list extraction assistant. Given an image containing a handwritten or printed list (grocery list, to-do list, shopping list, etc.), extract each list item as a separate entry.

Respond with valid JSON in this exact format:
{ "items": ["item 1", "item 2", "item 3"] }

Rules:
- Each item should be a concise string (the task title)
- Preserve the original wording as closely as possible
- If items have quantities (e.g. "2x milk"), include that in the string
- Ignore crossed-out or clearly deleted items
- If the image does not contain a recognizable list, return {"items": []}`;

export async function POST(request: NextRequest) {
  const parsed = RequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { images } = parsed.data;

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({
        userPrompt: 'Extract all list items visible in this image.',
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O,
        images: images.map(img => ({
          name: 'image',
          base64: img.base64,
          mimeType: img.mimeType,
        })),
        responseFormat: 'json',
      }),
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Unexpected response shape' },
      { status: 422 },
    );
  }

  const { outputs } = await res.json();
  const validated = ResponseSchema.safeParse(outputs?.[0]);

  if (!validated.success) {
    return NextResponse.json(
      { error: 'Unexpected response shape' },
      { status: 422 },
    );
  }

  return NextResponse.json(validated.data);
}
