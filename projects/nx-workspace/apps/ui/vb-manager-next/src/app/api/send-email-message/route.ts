import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  EMAIL_SERVICE_ENDPOINT,
  getEnvironmentVariable,
} from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { from, to, subject, text, html } = await request.json();

  if (!to || !subject) {
    return NextResponse.json(
      { error: 'to and subject are required' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const response = await fetch(
    `${getEnvironmentVariable('EMAIL_SERVICE_URL')}/${EMAIL_SERVICE_ENDPOINT.SEND_EMAIL}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': getEnvironmentVariable('SHARED_APP_TOKEN'),
      },
      body: JSON.stringify({ from, to, subject, text, html }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
