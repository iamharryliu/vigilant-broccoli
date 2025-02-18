import { EmployeeHandlerService } from '@vigilant-broccoli/employee-handler';
import { CONFIG, EMPLOYEE_HANDLER_ACTION } from '../../../../const';

export async function GET() {
  await EmployeeHandlerService.handleInput(
    CONFIG,
    EMPLOYEE_HANDLER_ACTION.APPLY_EMAIL_SIGNATURE_UPDATES,
  );
  return new Response();
}
