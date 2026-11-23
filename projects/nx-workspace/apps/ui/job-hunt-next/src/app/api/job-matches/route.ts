import { NextRequest, NextResponse } from 'next/server';
import {
  HTTP_STATUS_CODES,
  JOB_MATCHES_SKIP_REASON,
  type JobMatchesBookmarkletSkip,
} from '@vigilant-broccoli/common-js';
import {
  clearMatchBriefs,
  deleteMatchBrief,
  listPostingsWithBriefs,
} from '../../../lib/job-match-briefs.db';
import { startMissingMatchBriefRuns } from '../../../lib/match-brief-runner';
import { IS_DEMO } from '../../constants/demo';
import { deleteSuggestedMatchSkills } from '../../../lib/job-match-skills.db';
import {
  clearMatchPostings,
  clearMatchSkips,
  deleteMatchPosting,
  listMatchSkips,
  saveMatchPostings,
  saveMatchSkips,
} from '../../../lib/job-matches.db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const URL_PARAM = 'url';
const MAX_POSTING_TEXT = 30000;
const MAX_POSTED_LENGTH = 40;

const MAX_SKIP_TEXT = 300;
const LOG_PREFIX = '[job-matches]';

const isText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

const SKIP_REASONS: string[] = Object.values(JOB_MATCHES_SKIP_REASON);

const parseSkips = (value: unknown): JobMatchesBookmarkletSkip[] =>
  Array.isArray(value)
    ? value
        .filter(
          (skip): skip is JobMatchesBookmarkletSkip =>
            typeof skip?.title === 'string' &&
            typeof skip?.detail === 'string' &&
            SKIP_REASONS.includes(skip?.reason),
        )
        .map(({ title, reason, detail }) => ({
          title: title.slice(0, MAX_SKIP_TEXT),
          reason,
          detail: detail.slice(0, MAX_SKIP_TEXT),
        }))
    : [];

// The skips are also readable here so a scan that stored fewer postings than
// the page showed can be explained without the LinkedIn tab's console.
export async function GET() {
  return NextResponse.json({
    postings: listPostingsWithBriefs(),
    skips: listMatchSkips(),
  });
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
    console.error(
      `${LOG_PREFIX} rejected save: body had no postings array`,
      typeof body,
    );
    return NextResponse.json(
      { error: 'Invalid postings' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const received = Array.isArray(body.postings) ? body.postings.length : 0;
  if (received !== postings.length) {
    console.warn(
      `${LOG_PREFIX} dropped ${received - postings.length} of ${received} postings without a url or text`,
    );
  }
  const skips = parseSkips(body.skipped);
  skips.forEach(({ title, reason, detail }) =>
    console.warn(`${LOG_PREFIX} skipped (${reason}): ${title} | ${detail}`),
  );
  try {
    saveMatchSkips(skips);
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
  } catch (error) {
    console.error(`${LOG_PREFIX} failed to save postings`, error);
    return NextResponse.json(
      { error: 'Failed to save postings' },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }
  // Each batch the bookmarklet streams in gets briefs for its new postings;
  // a run's failure must not fail the save.
  if (!IS_DEMO) {
    startMissingMatchBriefRuns().catch(error =>
      console.error(`${LOG_PREFIX} failed to start briefs`, error),
    );
  }
  return NextResponse.json({ postings: listPostingsWithBriefs() });
}

// Removes the posting named by `url`, or every stored posting and suggested
// skill without it.
export async function DELETE(req: NextRequest) {
  const url = req.nextUrl.searchParams.get(URL_PARAM);
  if (url) {
    deleteMatchPosting(url);
    deleteMatchBrief(url);
  } else {
    clearMatchPostings();
    clearMatchBriefs();
    clearMatchSkips();
    deleteSuggestedMatchSkills();
  }
  return NextResponse.json({ postings: listPostingsWithBriefs() });
}
