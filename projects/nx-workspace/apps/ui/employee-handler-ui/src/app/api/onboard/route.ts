import {
  EmployeeHandlerService,
  MOCK_EMPLOYEE_HANDLER_CONFIG,
} from '@vigilant-broccoli/employee-handler';

export async function GET() {
  await EmployeeHandlerService.onboardIncomingEmployees(
    MOCK_EMPLOYEE_HANDLER_CONFIG,
  );
  return new Response();
}
