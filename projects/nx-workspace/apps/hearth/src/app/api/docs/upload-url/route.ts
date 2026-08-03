import { NextRequest } from 'next/server';
import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { createFileUploadUrl } from '../r2';
import { ALLOWED_MIME_TYPES } from '../file-processor';

export const runtime = 'nodejs';

const MAX_TARGETS_PER_REQUEST = 20;
const STAGING_KEY_PREFIX = 'staging/docs';

const RequestSchema = z.object({
  files: z
    .array(
      z.object({
        mimeType: z.string().refine(mime => ALLOWED_MIME_TYPES.has(mime)),
      }),
    )
    .min(1)
    .max(MAX_TARGETS_PER_REQUEST),
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
    parsed.data.files.map(async file => {
      const key = `${STAGING_KEY_PREFIX}/${crypto.randomUUID()}`;
      const uploadUrl = await createFileUploadUrl(key, file.mimeType);
      return { key, uploadUrl, mimeType: file.mimeType };
    }),
  );

  return Response.json({ targets });
}
