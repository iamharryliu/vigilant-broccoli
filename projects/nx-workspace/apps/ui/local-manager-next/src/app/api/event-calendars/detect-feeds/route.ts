import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { getUserEmail } from '../../../../../libs/server-auth';
import { detectFeeds } from '../../../../lib/event-scraper/feed-detection';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await getUserEmail(request))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const { urls = [], declaredUrls = [] } = await request.json();
  const asStrings = (values: unknown) =>
    Array.isArray(values)
      ? values.filter((value): value is string => typeof value === 'string')
      : [];

  return NextResponse.json({
    feeds: await detectFeeds(asStrings(urls), asStrings(declaredUrls)),
  });
}
