import { NextRequest, NextResponse } from 'next/server';
import { EMPLOYEE_HANDLER_CONFIG_MOCK } from '@vigilant-broccoli/employee-handler';
import {
  hasUpstream,
  forwardToUpstream,
} from '../../../../lib/handler-backend';

export async function POST(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  const { template } = await request.json();
  const signatures =
    await EMPLOYEE_HANDLER_CONFIG_MOCK.activeMaintenanceUtilities.fetchEmailSignatures();
  await EMPLOYEE_HANDLER_CONFIG_MOCK.activeMaintenanceUtilities.processEmailSignatures(
    signatures.map(sig => ({ ...sig, signatureString: template })),
  );
  return new NextResponse(null, { status: 204 });
}
