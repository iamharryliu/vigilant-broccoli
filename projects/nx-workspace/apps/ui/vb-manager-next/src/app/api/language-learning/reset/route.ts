import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import { resetUserData } from '../db';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  const userEmail = await getUserEmail(request);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  await resetUserData(userEmail);
  return NextResponse.json({ success: true });
}
