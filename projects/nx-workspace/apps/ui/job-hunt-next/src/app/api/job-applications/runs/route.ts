import { NextResponse } from 'next/server';
import { listJobApplicationRuns } from '../../../../lib/job-application-runs.db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ runs: listJobApplicationRuns() });
}
