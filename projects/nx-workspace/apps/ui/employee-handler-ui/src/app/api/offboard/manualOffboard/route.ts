import {
  EmployeeHandlerService,
  MOCK_EMPLOYEE_HANDLER_CONFIG,
} from '@vigilant-broccoli/employee-handler';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { emails } = await req.json();
  await EmployeeHandlerService.manualOffboardEmails(
    MOCK_EMPLOYEE_HANDLER_CONFIG,
    emails,
  );
  return new Response();
}
