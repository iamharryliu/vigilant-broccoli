import { NextRequest, NextResponse } from 'next/server';
import { listEmployeesByStatus } from '@vigilant-broccoli/employee-handler';
import {
  hasUpstream,
  forwardToUpstream,
} from '../../../../lib/handler-backend';

export async function GET(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  return NextResponse.json({ employees: listEmployeesByStatus('inactive') });
}
