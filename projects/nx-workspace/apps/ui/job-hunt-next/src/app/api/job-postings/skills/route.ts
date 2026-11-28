import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  POSTING_SKILL_STATUS,
  PostingSkillStatus,
} from '../../../constants/saved-postings';
import {
  deletePostingSkill,
  listPostingSkills,
  setPostingSkillStatus,
} from '../../../../lib/posting-skills.db';
import { listSavedPostings } from '../../../../lib/saved-postings.db';
import { startSkillSuggestionRun } from '../../../../lib/skill-suggestion-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NAME_PARAM = 'name';

const badRequest = (error: string) =>
  NextResponse.json({ error }, { status: HTTP_STATUS_CODES.BAD_REQUEST });

const isStatus = (value: unknown): value is PostingSkillStatus =>
  Object.values(POSTING_SKILL_STATUS).includes(value as PostingSkillStatus);

export async function GET() {
  return NextResponse.json({ skills: listPostingSkills() });
}

// Starts a Claude run that suggests skills the stored postings name.
export async function POST() {
  if (!listSavedPostings().length) return badRequest('Capture postings first');
  const run = await startSkillSuggestionRun();
  return NextResponse.json({ id: run.id, status: run.status });
}

// Accepts or dismisses the skill named by `name`.
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (typeof body?.name !== 'string' || !isStatus(body?.status)) {
    return badRequest('Invalid skill');
  }
  if (!setPostingSkillStatus(body.name, body.status)) {
    return NextResponse.json(
      { error: 'Skill not found' },
      { status: HTTP_STATUS_CODES.INVALID_PATH },
    );
  }
  return NextResponse.json({ skills: listPostingSkills() });
}

export async function DELETE(req: NextRequest) {
  const name = req.nextUrl.searchParams.get(NAME_PARAM);
  if (!name) return badRequest('Invalid skill');
  deletePostingSkill(name);
  return NextResponse.json({ skills: listPostingSkills() });
}
