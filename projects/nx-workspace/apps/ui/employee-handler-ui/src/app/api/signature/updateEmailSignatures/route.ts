import { EmployeeHandlerService } from '@vigilant-broccoli/employee-handler';
import { CONFIG } from '../../../../config';

export async function GET() {
  await EmployeeHandlerService.updateEmailSignatures(CONFIG);
  return new Response();
}
