import { NextRequest } from 'next/server';
import { VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-node';
import { proxyToExpress } from '../../../utils/express.utils';

export const runtime = 'nodejs';

interface ParseImageRequest {
  images: { base64: string; mimeType: string }[];
}

export async function POST(request: NextRequest) {
  const { images } = (await request.json()) as ParseImageRequest;

  return proxyToExpress(VB_EXPRESS_ENDPOINT.TASKS_PARSE_IMAGE, {
    images: images.map(img => ({ name: 'image', ...img })),
  });
}
