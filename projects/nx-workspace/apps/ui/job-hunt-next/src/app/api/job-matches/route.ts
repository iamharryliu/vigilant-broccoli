import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { deleteSuggestedMatchSkills } from '../../../lib/job-match-skills.db';
import {
  clearMatchPostings,
  deleteMatchPosting,
  listMatchPostings,
  saveMatchPostings,
} from '../../../lib/job-matches.db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const URL_PARAM = 'url';
const MAX_POSTING_TEXT = 30000;
const MAX_POSTED_LENGTH = 40;

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

export async function GET() {
  return NextResponse.json({ postings: listMatchPostings() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const postings = Array.isArray(body?.postings)
    ? body.postings.filter(
        (posting: Record<string, unknown>) =>
          isText(posting?.url) && isText(posting?.text),
      )
    : null;
  if (!postings) {
    return NextResponse.json(
      { error: 'Invalid postings' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  saveMatchPostings(
    postings.map(
      (posting: {
        url: string;
        title?: unknown;
        text: string;
        posted?: unknown;
        easyApply?: unknown;
      }) => ({
        url: posting.url,
        title: typeof posting.title === 'string' ? posting.title : '',
        text: posting.text.slice(0, MAX_POSTING_TEXT),
        posted:
          typeof posting.posted === 'string'
            ? posting.posted.slice(0, MAX_POSTED_LENGTH)
            : '',
        easyApply:
          typeof posting.easyApply === 'boolean'
            ? posting.easyApply
            : undefined,
      }),
    ),
  );
  return NextResponse.json({ postings: listMatchPostings() });
}

// Removes the posting named by `url`, or every stored posting and suggested
// skill without it.
export async function DELETE(req: NextRequest) {
  const url = req.nextUrl.searchParams.get(URL_PARAM);
  if (url) deleteMatchPosting(url);
  else {
    clearMatchPostings();
    deleteSuggestedMatchSkills();
  }
  return NextResponse.json({ postings: listMatchPostings() });
}
