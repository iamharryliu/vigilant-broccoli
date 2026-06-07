import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  getEnvironmentVariable,
  VB_EXPRESS_ENDPOINT,
} from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CONTENT_TYPE = 'content-type';
const MULTIPART = 'multipart/form-data';
const APPLICATION_JSON = 'application/json';

export async function POST(request: NextRequest) {
  const requestContentType = request.headers.get(CONTENT_TYPE) ?? '';
  const isMultipart = requestContentType.includes(MULTIPART);

  const headers: Record<string, string> = {
    'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
    [CONTENT_TYPE]: isMultipart ? requestContentType : APPLICATION_JSON,
  };

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

  const responseContentType = res.headers.get(CONTENT_TYPE) ?? '';
  if (!responseContentType.includes(APPLICATION_JSON)) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
