import { NextRequest, NextResponse } from 'next/server';
import { VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-js';
import { proxyToExpress } from '../../../utils/express.utils';
import { requireAuth } from '../../../../../libs/api-auth';

export const runtime = 'nodejs';

interface ParseRequest {
  text?: string;
  images?: { base64: string; mimeType: string }[];
  availableLists?: { id: string; title: string }[];
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { text, images, availableLists } =
    (await request.json()) as ParseRequest;

  return proxyToExpress(VB_EXPRESS_ENDPOINT.TASKS_PARSE_IMAGE, {
    text,
    images: (images ?? []).map(img => ({ name: 'image', ...img })),
    availableLists,
  });
}
