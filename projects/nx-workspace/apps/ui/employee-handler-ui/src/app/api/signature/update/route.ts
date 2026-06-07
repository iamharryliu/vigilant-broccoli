import { NextRequest, NextResponse } from 'next/server';
import { EMPLOYEE_HANDLER_CONFIG_MOCK } from '@vigilant-broccoli/employee-handler';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  hasUpstream,
  forwardToUpstream,
} from '../../../../lib/handler-backend';

export async function POST(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  const { email, template } = await request.json();
  await EMPLOYEE_HANDLER_CONFIG_MOCK.activeMaintenanceUtilities.processEmailSignatures(
    [{ email, signatureString: template }],
  );
  return new NextResponse(null, { status: HTTP_STATUS_CODES.NO_CONTENT });
}
