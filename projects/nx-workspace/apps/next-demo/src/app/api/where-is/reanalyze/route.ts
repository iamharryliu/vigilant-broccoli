import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getEnvironmentVariable, VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-node';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';
import { getImageUrl } from '../r2';
import { compressBufferForLlm } from '../image-processor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({ id: z.string() });

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
  const supabase = createServerClient(accessToken);
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const { id } = parsed.data;

  const { data: imageRows } = await supabase
    .from('where_is_images')
    .select('r2_key, mime_type, sort_order')
    .eq('item_id', id)
    .order('sort_order');

  if (!imageRows?.length) {
    return Response.json(
      { error: 'No images found for item.' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const images = await Promise.all(
    imageRows.map(async row => {
      const res = await fetch(getImageUrl(row.r2_key));
      const buffer = Buffer.from(await res.arrayBuffer());
      const compressed = await compressBufferForLlm(buffer);
      return { name: row.r2_key, ...compressed };
    }),
  );

  const llmRes = await fetch(
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
        images,
        responseFormat: 'json',
      }),
    },
  );

  if (!llmRes.ok) {
    const body = await llmRes.text();
    console.error('LLM request failed', llmRes.status, body);
    return Response.json(
      { error: 'LLM request failed.' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { outputs } = await llmRes.json();
  const validated = AnalyzeResponseSchema.safeParse(outputs?.[0]);
  if (!validated.success) {
    return Response.json(
      { error: 'Unexpected LLM response shape.' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { description, tags } = validated.data;

  const { error } = await supabase
    .from('where_is_items')
    .update({ description, tags })
    .eq('id', id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json({ description, tags });
}
