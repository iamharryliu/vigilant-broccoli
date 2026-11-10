import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { searchKnowledgeBase } from '../../../../lib/knowledge-base';

export const runtime = 'nodejs';

const QUERY_PARAM = 'q';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get(QUERY_PARAM)?.trim();
  if (!query) {
    return NextResponse.json(
      { error: 'Missing query' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  try {
    return NextResponse.json({ matches: await searchKnowledgeBase(query) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
}
