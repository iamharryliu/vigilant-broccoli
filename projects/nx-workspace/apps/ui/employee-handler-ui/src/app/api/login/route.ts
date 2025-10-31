import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { NextRequest, NextResponse } from 'next/server';
import { getEnvironmentVariable } from '@vigilant-broccoli/common-node';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (username === getEnvironmentVariable('USERNAME') && password === getEnvironmentVariable('PASSWORD')) {
    return NextResponse.json({});
  }
  return NextResponse.json({}, { status: HTTP_STATUS_CODES.BAD_REQUEST });
}
