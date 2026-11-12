import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  MATCH_SKILL_STATUS,
  MatchSkillStatus,
} from '../../../constants/matches';
import {
  deleteMatchSkill,
  listMatchSkills,
  setMatchSkillStatus,
} from '../../../../lib/job-match-skills.db';
import { listMatchPostings } from '../../../../lib/job-matches.db';
import { startSkillSuggestionRun } from '../../../../lib/skill-suggestion-runner';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NAME_PARAM = 'name';

const badRequest = (error: string) =>
  NextResponse.json({ error }, { status: HTTP_STATUS_CODES.BAD_REQUEST });

const isStatus = (value: unknown): value is MatchSkillStatus =>
  Object.values(MATCH_SKILL_STATUS).includes(value as MatchSkillStatus);

export async function GET() {
  return NextResponse.json({ skills: listMatchSkills() });
}

// Starts a Claude run that suggests skills the stored postings name.
export async function POST() {
  if (!listMatchPostings().length) return badRequest('Capture postings first');
  const run = await startSkillSuggestionRun();
  return NextResponse.json({ id: run.id, status: run.status });
}

// Accepts or dismisses the skill named by `name`.
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (typeof body?.name !== 'string' || !isStatus(body?.status)) {
    return badRequest('Invalid skill');
  }
  if (!setMatchSkillStatus(body.name, body.status)) {
    return NextResponse.json(
      { error: 'Skill not found' },
      { status: HTTP_STATUS_CODES.INVALID_PATH },
    );
  }
  return NextResponse.json({ skills: listMatchSkills() });
}

export async function DELETE(req: NextRequest) {
  const name = req.nextUrl.searchParams.get(NAME_PARAM);
  if (!name) return badRequest('Invalid skill');
  deleteMatchSkill(name);
  return NextResponse.json({ skills: listMatchSkills() });
}
