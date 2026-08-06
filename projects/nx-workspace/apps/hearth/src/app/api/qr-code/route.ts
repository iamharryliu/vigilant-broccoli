import { NextRequest } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { QRCodeService } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  if (!url) {
    return Response.json(
      { error: 'url is required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const dataUrl = await QRCodeService.generateDataUrl(url);
  return Response.json({ dataUrl });
}
