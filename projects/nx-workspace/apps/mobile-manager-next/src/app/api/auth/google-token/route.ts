import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { requireAuth } from '../../../../../libs/api-auth';
import { storeGoogleRefreshToken } from '../../../../../libs/google-token';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const { refreshToken } = await request.json();
  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Missing refreshToken' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  await storeGoogleRefreshToken(auth.userEmail, refreshToken);
  return NextResponse.json({ success: true });
}
