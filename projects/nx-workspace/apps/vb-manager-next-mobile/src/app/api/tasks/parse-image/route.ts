import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const RequestSchema = z.object({
  images: z
    .array(z.object({ base64: z.string(), mimeType: z.string() }))
    .min(1),
});

const ResponseSchema = z.object({
  items: z.array(z.string()),
});

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
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract all list items visible in this image.',
          },
          ...images.map(img => ({
            type: 'image_url' as const,
            image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
          })),
        ],
      },
    ],
  });

  const raw = JSON.parse(response.choices[0].message.content ?? '{}');
  const validated = ResponseSchema.safeParse(raw);
  if (!validated.success) {
    return NextResponse.json(
      { error: 'Unexpected response shape' },
      { status: 422 },
    );
  }

  return NextResponse.json(validated.data);
}
