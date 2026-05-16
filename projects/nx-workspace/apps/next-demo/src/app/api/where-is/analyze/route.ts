import { NextRequest } from 'next/server';
import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';
import { compressForLlm } from '../image-processor';
import { analyzeImages } from '../llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  images: z
    .array(z.object({ base64: z.string(), mimeType: z.string() }))
    .min(1),
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

  const images = await Promise.all(
    parsed.data.images.map(async (img, i) => {
      const compressed = await compressForLlm(img.base64);
      return { name: `storage_${i}`, ...compressed };
    }),
  );

  const result = await analyzeImages(images);
  return Response.json(result);
}
