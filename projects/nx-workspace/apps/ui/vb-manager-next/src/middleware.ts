import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/((?!auth).*)'],
};
