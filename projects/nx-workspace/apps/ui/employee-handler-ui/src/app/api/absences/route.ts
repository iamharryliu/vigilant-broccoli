import { NextRequest, NextResponse } from 'next/server';
import { EMPLOYEE_HANDLER_CONFIG_MOCK } from '@vigilant-broccoli/employee-handler';
import { hasUpstream, forwardToUpstream } from '../../../lib/handler-backend';

export async function GET(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  const absences =
    await EMPLOYEE_HANDLER_CONFIG_MOCK.absenceUtilities.fetchAbsences();
  return NextResponse.json({ absences });
}
