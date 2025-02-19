import { EmployeeHandlerService } from '@vigilant-broccoli/employee-handler';
import { CONFIG } from '../../../config';

export async function GET() {
  await EmployeeHandlerService.offboardInactiveEmployees(CONFIG);
  return new Response();
}
