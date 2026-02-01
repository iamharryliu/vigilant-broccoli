import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VB_EXPRESS_URL = process.env.VB_EXPRESS_URL || 'http://localhost:3333';
const VB_EXPRESS_API_KEY = process.env.VB_EXPRESS_API_KEY;

export async function POST(request: NextRequest) {
  const { body, from, to } = await request.json();

  if (!body || !from || !to) {
    return NextResponse.json(
      { error: 'body, from, and to are required' },
      { status: 400 }
    );
  }

  const response = await fetch(`${VB_EXPRESS_URL}/api/send-text-message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': VB_EXPRESS_API_KEY || '',
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
