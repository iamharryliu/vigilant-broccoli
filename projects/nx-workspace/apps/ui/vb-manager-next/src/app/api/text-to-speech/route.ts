import { getVbExpressApiKey } from '../../../lib/vb-express';
import { NextRequest } from 'next/server';
import { VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.TEXT_TO_SPEECH}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getVbExpressApiKey(),
      },
      body: await request.text(),
    },
  );

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
