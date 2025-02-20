import {
  EmployeeHandlerService,
  EMPLOYEE_HANDLER_CONFIG_MOCK,
} from '@vigilant-broccoli/employee-handler';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { emails } = await req.json();
  await EmployeeHandlerService.emailZippedSignatures(
    EMPLOYEE_HANDLER_CONFIG_MOCK,
    emails,
  );
  return new Response();
}
