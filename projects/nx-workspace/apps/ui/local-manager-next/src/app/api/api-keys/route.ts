import { getVbExpressApiKey } from '../../../lib/vb-express';
import { NextRequest, NextResponse } from 'next/server';
import {
  API_KEY_HEADER,
  HTTP_HEADERS,
  VB_EXPRESS_ADMIN_ENDPOINT,
} from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const adminApiKeysUrl = () =>
  `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ADMIN_ENDPOINT.API_KEYS}`;

export async function GET() {
  const res = await fetch(adminApiKeysUrl(), {
    headers: { [API_KEY_HEADER]: getVbExpressApiKey() },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(adminApiKeysUrl(), {
    method: 'POST',
    headers: {
      ...HTTP_HEADERS.CONTENT_TYPE.JSON,
      [API_KEY_HEADER]: getVbExpressApiKey(),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
