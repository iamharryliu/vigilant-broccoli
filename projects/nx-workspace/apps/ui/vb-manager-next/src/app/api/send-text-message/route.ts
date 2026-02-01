import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { body, from, to } = await request.json();

  if (!body || !from || !to) {
    return NextResponse.json(
      { error: 'body, from, and to are required' },
      { status: 400 },
    );
  }

  const response = await fetch(`${getEnvironmentVariable('VB_EXPRESS_URL')}/api/send-text-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': getEnvironmentVariable('VB_EXPRESS_API_KEY'),
    },
    body: JSON.stringify({
      body,
      from,
      to,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
