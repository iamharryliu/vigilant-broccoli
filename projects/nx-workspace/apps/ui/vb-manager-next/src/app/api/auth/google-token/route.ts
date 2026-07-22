import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import { storeGoogleRefreshToken } from '../../../../../libs/google-token';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { refreshToken } = await request.json();
  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Missing refreshToken' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  await storeGoogleRefreshToken(userEmail, refreshToken);
  return NextResponse.json({ success: true });
}
