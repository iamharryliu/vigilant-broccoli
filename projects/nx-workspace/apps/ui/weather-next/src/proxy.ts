import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { isStagingUiRequestAuthorized } from '@vigilant-broccoli/common-node';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  if (await isStagingUiRequestAuthorized(request)) {
    return NextResponse.next();
  }
  return new NextResponse('Forbidden', { status: HTTP_STATUS_CODES.FORBIDDEN });
}

export const config = { matcher: '/:path*' };
