import {
  EmployeeHandlerService,
  EMPLOYEE_HANDLER_CONFIG_MOCK,
} from '@vigilant-broccoli/employee-handler';

export async function GET() {
  await EmployeeHandlerService.updateEmailSignatures(
    EMPLOYEE_HANDLER_CONFIG_MOCK,
  );
  return new Response();
}
