import { NextRequest, NextResponse } from 'next/server';
import { getSecurityNews } from '@vigilant-broccoli/security-news';
import { requireAuth } from '../../../../libs/api-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  return NextResponse.json(await getSecurityNews());
}
