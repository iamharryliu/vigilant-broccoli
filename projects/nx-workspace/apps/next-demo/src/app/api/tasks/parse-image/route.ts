import { NextRequest } from 'next/server';
import { z } from 'zod';
import { LLMService } from '@vigilant-broccoli/llm-tools';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
{
  "items": ["item 1", "item 2", "item 3"]
}

Rules:
- Each item should be a concise string (the task title)
- Preserve the original wording as closely as possible
- If items have quantities (e.g. "2x milk"), include that in the string
- Ignore crossed-out or clearly deleted items
- If the image does not contain a recognizable list, return {"items": []}`;

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

  const { images } = parsed.data;

  const result = await LLMService.prompt({
    prompt: {
      userPrompt: 'Extract all list items visible in this image.',
      systemPrompt: SYSTEM_PROMPT,
      images: images.map((img, i) => ({
        name: `list_${i}`,
        base64: img.base64,
        mimeType: img.mimeType,
      })),
    },
    modelConfig: { model: LLM_MODEL.GPT_4O, temperature: 0.2 },
  });

  const jsonMatch = (result.data as string).match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json(
      { error: 'Failed to parse LLM response' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const validated = ResponseSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!validated.success) {
    return Response.json(
      { error: 'Unexpected LLM response shape' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json(validated.data);
}
