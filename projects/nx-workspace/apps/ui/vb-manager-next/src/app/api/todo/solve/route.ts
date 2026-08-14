import { NextRequest, NextResponse } from 'next/server';
import { GithubService } from '@vigilant-broccoli/github-workspace';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const TODO_REPO = 'iamharryliu/vigilant-broccoli';
const MANUAL_AGENTIC_SOLVE_WORKFLOW = 'manual-agentic-solve.yml';
const TODO_ID_PATTERN = /^[0-9a-fA-F]{6}$/;

export async function POST(request: NextRequest) {
  const { id } = await request.json();

  if (typeof id !== 'string' || !TODO_ID_PATTERN.test(id)) {
    return NextResponse.json(
      { error: 'Invalid TODO id' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  await GithubService.dispatchWorkflow(
    TODO_REPO,
    MANUAL_AGENTIC_SOLVE_WORKFLOW,
    { ids: id },
  );

  return NextResponse.json({ success: true });
}
