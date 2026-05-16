import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getEnvironmentVariable, VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-node';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  images: z
    .array(z.object({ base64: z.string(), mimeType: z.string() }))
    .min(1),
});

const AnalyzeResponseSchema = z.object({
  description: z.string(),
  tags: z.array(z.string()),
});

const SYSTEM_PROMPT = `You are a household item identifier. Given one or more images of a storage area (drawer, shelf, cabinet, box, etc.), identify all visible items across all images.

Respond with valid JSON in this exact format:
{
  "description": "Brief description of the storage area and its contents",
  "tags": ["item1", "item2", "item3"]
}

The tags should be individual items found across all images. Keep them lowercase and concise (1-3 words each). Include 5-20 items.`;

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

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.LLM}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({
        userPrompt: 'Identify all items visible across these storage area images.',
        systemPrompt: SYSTEM_PROMPT,
        model: LLM_MODEL.GPT_4O,
        images: images.map((img, i) => ({
          name: `storage_${i}`,
          base64: img.base64,
          mimeType: img.mimeType,
        })),
        responseFormat: 'json',
      }),
    },
  );

  if (!res.ok) {
    return Response.json(
      { error: 'Failed to parse LLM response' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { outputs } = await res.json();
  const validated = AnalyzeResponseSchema.safeParse(outputs?.[0]);
  if (!validated.success) {
    return Response.json(
      { error: 'Unexpected LLM response shape' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json(validated.data);
}
