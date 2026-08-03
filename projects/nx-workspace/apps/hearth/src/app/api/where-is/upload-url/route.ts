import { NextRequest } from 'next/server';
import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { createImageUploadUrl } from '../r2';
import { ALLOWED_MIME_TYPES } from '../image-processor';

export const runtime = 'nodejs';

const MAX_TARGETS_PER_REQUEST = 10;
const STAGING_KEY_PREFIX = 'staging/where-is';

const RequestSchema = z.object({
  count: z.number().int().min(1).max(MAX_TARGETS_PER_REQUEST),
  mimeType: z.string().refine(mime => ALLOWED_MIME_TYPES.has(mime)),
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
  const { count, mimeType } = parsed.data;

  const targets = await Promise.all(
    Array.from({ length: count }, async () => {
      const key = `${STAGING_KEY_PREFIX}/${crypto.randomUUID()}`;
      const uploadUrl = await createImageUploadUrl(key, mimeType);
      return { key, uploadUrl, mimeType };
    }),
  );

  return Response.json({ targets });
}
