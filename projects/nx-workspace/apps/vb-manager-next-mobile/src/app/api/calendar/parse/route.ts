import { NextRequest } from 'next/server';
import { VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-node';
import { proxyToExpress } from '../../../utils/express.utils';

export const runtime = 'nodejs';

interface ParseRequest {
  text?: string;
  images?: { data: string; mimeType: string }[];
  timeZone?: string;
}

export async function POST(request: NextRequest) {
  const { text, images, timeZone } = (await request.json()) as ParseRequest;

  return proxyToExpress(VB_EXPRESS_ENDPOINT.CALENDAR_PARSE, {
    text,
    images: (images ?? []).map(img => ({
      name: 'image',
      base64: img.data,
      mimeType: img.mimeType,
    })),
    timeZone,
  });
}
