import { NextRequest, NextResponse } from 'next/server';
import { open } from '@vigilant-broccoli/common-node';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function POST(request: NextRequest) {
  const { type, target } = await request.json();
  await open(type, target);
  return new NextResponse(null, { status: HTTP_STATUS_CODES.OK });
}
