import { NextRequest } from 'next/server';
import { VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-node';
import { proxyToExpress } from '../../../utils/express.utils';

export const runtime = 'nodejs';

interface ParseRequest {
  text?: string;
  images?: { base64: string; mimeType: string }[];
}

export async function POST(request: NextRequest) {
  const { text, images } = (await request.json()) as ParseRequest;

  return proxyToExpress(VB_EXPRESS_ENDPOINT.TASKS_PARSE_IMAGE, {
    text,
    images: (images ?? []).map(img => ({ name: 'image', ...img })),
  });
}
