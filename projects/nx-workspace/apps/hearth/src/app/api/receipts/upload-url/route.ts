import { NextRequest } from 'next/server';
import { z } from 'zod';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { BucketError, createImageUploadUrl, STAGING_KEY_PREFIX } from '../r2';
import { ALLOWED_MIME_TYPES } from '../image-processor';
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGES_PER_RECEIPT } from '../limits';
import {
  ERROR_SESSION_REJECTED,
  ERROR_STAGE,
  missingAuthHeaderError,
} from '../consts';

const UPLOAD_URL_ROUTE = '/api/receipts/upload-url';

export const runtime = 'nodejs';

const RequestSchema = z.object({
  images: z
    .array(
      z.object({
        mimeType: z.string().refine(mime => ALLOWED_MIME_TYPES.has(mime)),
        size: z.number().int().positive().max(MAX_IMAGE_SIZE_BYTES),
      }),
    )
    .min(1)
    .max(MAX_IMAGES_PER_RECEIPT),
});

export async function POST(request: NextRequest) {
  const token = getBearerToken(request);
  const {
    data: { user },
  } = await createServerClient(token).auth.getUser();
  if (!user) {
    return Response.json(
      {
        error: token
          ? ERROR_SESSION_REJECTED
          : missingAuthHeaderError(UPLOAD_URL_ROUTE),
        stage: ERROR_STAGE.HEARTH_AUTH,
      },
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

  try {
    const targets = await Promise.all(
      parsed.data.images.map(async image => {
        const key = `${STAGING_KEY_PREFIX}/${crypto.randomUUID()}`;
        const uploadUrl = await createImageUploadUrl(key, image.mimeType);
        return { key, uploadUrl, mimeType: image.mimeType };
      }),
    );
    return Response.json({ targets });
  } catch (e) {
    if (e instanceof BucketError) {
      // vb-express rejected us, not the browser — report it as a bad gateway so
      // it is not mistaken for the user's session having expired.
      return Response.json(
        { error: e.message, stage: ERROR_STAGE.VB_EXPRESS_STORAGE },
        { status: HTTP_STATUS_CODES.BAD_GATEWAY },
      );
    }
    throw e;
  }
}
