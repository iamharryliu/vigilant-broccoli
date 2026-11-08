import { NextRequest, NextResponse } from 'next/server';
import {
  listTaskLists,
  isExpiredError,
  GOOGLE_TOKEN_EXPIRED,
} from '@vigilant-broccoli/google-workspace';
import { requireGoogleAuth } from '../../../../../libs/api-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await requireGoogleAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const taskLists = await listTaskLists(auth.googleToken);
    return NextResponse.json({ taskLists });
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
