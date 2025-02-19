import { EmployeeHandlerService } from '@vigilant-broccoli/employee-handler';
import { CONFIG } from '../../../../config';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { emails } = await req.json();
  await EmployeeHandlerService.manualOffboardEmails(CONFIG, emails);
  return new Response();
}
