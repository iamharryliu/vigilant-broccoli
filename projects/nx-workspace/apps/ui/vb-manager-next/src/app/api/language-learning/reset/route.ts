import { NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { resetUserData } from '../db';

export const runtime = 'nodejs';

const getUserEmail = async (): Promise<string | null> => {
  const session = await getServerSession(authOptions);
  return session?.userEmail ?? session?.user?.email ?? null;
};

export async function DELETE() {
  const userEmail = await getUserEmail();
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }
  await resetUserData(userEmail);
  return NextResponse.json({ success: true });
}
