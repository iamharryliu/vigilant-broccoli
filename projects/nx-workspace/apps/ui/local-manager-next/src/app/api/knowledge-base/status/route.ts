import { NextResponse } from 'next/server';
import { listIndexStatuses } from '../knowledge-base.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ statuses: listIndexStatuses() });
}
