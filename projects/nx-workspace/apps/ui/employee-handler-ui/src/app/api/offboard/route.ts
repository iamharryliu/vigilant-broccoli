import { EmployeeHandlerService } from '@vigilant-broccoli/employee-handler';
import { CONFIG, EMPLOYEE_HANDLER_ACTION } from '../../../config';

export async function GET() {
  await EmployeeHandlerService.handleInput(
    CONFIG,
    EMPLOYEE_HANDLER_ACTION.OFFBOARD_INACTIVE_EMPLOYEES,
  );
  return new Response();
}
