import { NextRequest, NextResponse } from 'next/server';
import { VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { requireAuth } from '../../../../libs/api-auth';
import { getVbExpressApiKey } from '../../utils/express.utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const contentType = request.headers.get('content-type') ?? '';

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.SPEECH_TO_TEXT}`,
    {
      method: 'POST',
      headers: {
        'x-api-key': getVbExpressApiKey(),
        'content-type': contentType,
      },
      body: request.body,
      // @ts-expect-error Node fetch supports duplex
      duplex: 'half',
    },
  );

  const data = await res.json();
  return NextResponse.json(
    { text: data.transcript ?? data.text },
    { status: res.status },
  );
}
