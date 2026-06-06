import { NextRequest, NextResponse } from 'next/server';
import { EMPLOYEE_HANDLER_CONFIG_MOCK } from '@vigilant-broccoli/employee-handler';
import {
  hasUpstream,
  forwardToUpstream,
} from '../../../../lib/handler-backend';

export async function GET(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  const employees =
    await EMPLOYEE_HANDLER_CONFIG_MOCK.offboardUtilities.fetchInactiveEmployees();
  return NextResponse.json({ employees });
}
