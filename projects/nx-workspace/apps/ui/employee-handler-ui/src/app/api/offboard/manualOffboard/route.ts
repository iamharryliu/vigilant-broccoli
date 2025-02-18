import { CONFIG } from '../../../../config';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { emails } = await req.json();
  await CONFIG.offboardUtilities.processInactiveEmployees(emails);
  return new Response();
}
