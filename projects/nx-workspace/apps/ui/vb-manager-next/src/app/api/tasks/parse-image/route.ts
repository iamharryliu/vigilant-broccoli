import { NextRequest, NextResponse } from 'next/server';
import { VB_EXPRESS_ENDPOINT } from '@vigilant-broccoli/common-js';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();

  const res = await fetch(
    `${getEnvironmentVariable('VB_EXPRESS_URL')}/${VB_EXPRESS_ENDPOINT.TASKS_PARSE_IMAGE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
      },
      body,
    },
  );

  const data = await res.json().catch(() => ({ error: 'Invalid response' }));
  return NextResponse.json(data, { status: res.status });
}
