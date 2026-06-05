import { NextResponse } from 'next/server';
import { EMPLOYEE_HANDLER_CONFIG_MOCK } from '@vigilant-broccoli/employee-handler';

export async function GET() {
  const signatures =
    await EMPLOYEE_HANDLER_CONFIG_MOCK.activeMaintenanceUtilities.fetchEmailSignatures();
  return NextResponse.json({ signatures });
}
