import { NextRequest, NextResponse } from 'next/server';
import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CONTENT_TYPE = 'content-type';
const APPLICATION_JSON = 'application/json';

export async function POST(request: NextRequest) {
  const contentType = request.headers.get(CONTENT_TYPE) ?? '';

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.SPEECH_TO_TEXT}`,
    {
      method: 'POST',
      headers: {
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
        [CONTENT_TYPE]: contentType,
      },
      body: request.body,
      // @ts-expect-error Node fetch supports duplex
      duplex: 'half',
    },
  );

  const responseContentType = res.headers.get(CONTENT_TYPE) ?? '';
  if (!responseContentType.includes(APPLICATION_JSON)) {
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 },
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
