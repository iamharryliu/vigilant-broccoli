import { NextRequest, NextResponse } from 'next/server';
import { GcloudService } from '@vigilant-broccoli/devops-cli';
import { createTtlCache } from '../../../utils/ttl-cache.utils';

const REAUTH_CACHE_TTL_MS = 5 * 60 * 1000;

const getCachedReauthStatus = createTtlCache(
  REAUTH_CACHE_TTL_MS,
  GcloudService.getReauthStatus,
);

export async function GET(request: NextRequest) {
  const forceFresh = request.nextUrl.searchParams.get('fresh') === '1';
  return NextResponse.json(await getCachedReauthStatus(forceFresh));
}
