import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import {
  HTTP_STATUS_CODES,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { createServerClient } from '../../../../../libs/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IMAGE_NAME_PREFIX = 'receipt_';

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

  const images = parsed.data.images.map((img, i) => ({
    name: `${IMAGE_NAME_PREFIX}${i}`,
    base64: img.base64,
    mimeType: img.mimeType,
  }));

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.PRICE_TRACKER_ANALYZE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body: JSON.stringify({ images }),
    },
  );

  if (!res.ok) {
    return Response.json(
      { error: 'Failed to parse receipt' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json(await res.json());
}
