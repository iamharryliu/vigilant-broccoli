import { NextRequest } from 'next/server';
import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { createImageUploadUrl } from '../r2';
import { ALLOWED_MIME_TYPES } from '../image-processor';
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES_PER_UPLOAD } from '../limits';

export const runtime = 'nodejs';

const STAGING_KEY_PREFIX = 'staging/where-is';

const RequestSchema = z.object({
  images: z
    .array(
      z.object({
        mimeType: z.string().refine(mime => ALLOWED_MIME_TYPES.has(mime)),
        size: z.number().int().positive().max(MAX_IMAGE_SIZE_BYTES),
      }),
    )
    .min(1)
    .max(MAX_IMAGES_PER_UPLOAD),
});

export async function POST(request: NextRequest) {
  const {
    data: { user },
  } = await createServerClient(getBearerToken(request)).auth.getUser();
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

  const targets = await Promise.all(
    parsed.data.images.map(async image => {
      const key = `${STAGING_KEY_PREFIX}/${crypto.randomUUID()}`;
      const uploadUrl = await createImageUploadUrl(key, image.mimeType);
      return { key, uploadUrl, mimeType: image.mimeType };
    }),
  );

  return Response.json({ targets });
}
