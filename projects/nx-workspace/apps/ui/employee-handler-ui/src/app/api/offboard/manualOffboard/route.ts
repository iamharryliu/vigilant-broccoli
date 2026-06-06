import { NextRequest } from 'next/server';
import {
  EmployeeHandlerService,
  EMPLOYEE_HANDLER_CONFIG_MOCK,
} from '@vigilant-broccoli/employee-handler';
import {
  hasUpstream,
  forwardToUpstream,
} from '../../../../lib/handler-backend';

export async function POST(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  const { emails } = await request.json();
  await EmployeeHandlerService.manualOffboardEmails(
    EMPLOYEE_HANDLER_CONFIG_MOCK,
    emails,
  );
  return new Response();
}
