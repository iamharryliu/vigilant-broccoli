import { NextResponse } from 'next/server';
import { syncResumeVersions } from '../../../../lib/resume-versions.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ versions: await syncResumeVersions() });
}
