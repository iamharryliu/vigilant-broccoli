import { NextRequest, NextResponse } from 'next/server';
import {
  listTaskLists,
  isExpiredError,
  GOOGLE_TOKEN_EXPIRED,
} from '@vigilant-broccoli/google-workspace';
import { requireAuth } from '../../../../../libs/api-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, { requireGoogleToken: true });
  if (auth instanceof NextResponse) return auth;

  try {
    const lists = await listTaskLists(auth.googleToken as string);
    return NextResponse.json({ lists });
  } catch (error) {
    if (isExpiredError(error)) {
      return NextResponse.json(
        { error: GOOGLE_TOKEN_EXPIRED },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch task lists' },
      { status: 500 },
    );
  }
}
