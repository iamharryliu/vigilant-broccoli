import { EmployeeHandlerService } from '@vigilant-broccoli/employee-handler';
import { CONFIG, EMPLOYEE_HANDLER_ACTION } from '../../../const';

export async function GET() {
  await EmployeeHandlerService.handleInput(
    CONFIG,
    EMPLOYEE_HANDLER_ACTION.ONBOARD_INCOMING_EMPLOYEES,
  );
  return new Response();
}
