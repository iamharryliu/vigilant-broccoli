import { NextRequest } from 'next/server';
import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';
import { getImageUrl } from '../r2';
import { compressForLlm } from '../image-processor';
import { analyzeImages } from '../llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  id: z.string(),
  existingTags: z.array(z.string()).optional(),
});

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

  const { id, existingTags } = parsed.data;

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
      const compressed = await compressForLlm(buffer);
      return { name: row.r2_key, ...compressed };
    }),
  );

  const { description, tags: newTags } = await analyzeImages(
    images,
    existingTags,
  );
  const mergedTags = existingTags
    ? [...existingTags, ...newTags.filter(t => !existingTags.includes(t))]
    : newTags;
  return Response.json({ description, tags: mergedTags });
}
