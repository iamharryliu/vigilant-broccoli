import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VB_EXPRESS_URL = process.env.VB_EXPRESS_URL || 'http://localhost:3333';
const VB_EXPRESS_API_KEY = process.env.VB_EXPRESS_API_KEY;

export async function POST(request: NextRequest) {
  const { from, to, subject, text, html } = await request.json();

  if (!to || !subject) {
    return NextResponse.json(
      { error: 'to and subject are required' },
      { status: 400 }
    );
  }

  const response = await fetch(`${VB_EXPRESS_URL}/api/send-email-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': VB_EXPRESS_API_KEY || '',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(data);
}
