import { NextRequest, NextResponse } from 'next/server';
import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? '';
  const isMultipart = contentType.includes('multipart/form-data');

  const headers: Record<string, string> = {
    'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
  };
  if (isMultipart) {
    headers['content-type'] = contentType;
  } else {
    headers['content-type'] = 'application/json';
  }

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.VOICE_LIST}`,
    {
      method: 'POST',
      headers,
      body: request.body,
      // @ts-expect-error Node fetch supports duplex
      duplex: 'half',
    },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
