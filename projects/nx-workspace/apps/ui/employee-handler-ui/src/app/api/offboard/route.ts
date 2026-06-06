import { NextRequest } from 'next/server';
import {
  EmployeeHandlerService,
  EMPLOYEE_HANDLER_CONFIG_MOCK,
} from '@vigilant-broccoli/employee-handler';
import { hasUpstream, forwardToUpstream } from '../../../lib/handler-backend';

export async function GET(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  await EmployeeHandlerService.offboardInactiveEmployees(
    EMPLOYEE_HANDLER_CONFIG_MOCK,
  );
  return new Response();
}
