import { NextRequest } from 'next/server';
import { EMPLOYEE_HANDLER_CONFIG_MOCK } from '@vigilant-broccoli/employee-handler';
import {
  hasUpstream,
  forwardToUpstream,
} from '../../../../lib/handler-backend';

type ProcessIncomingArgs = Parameters<
  typeof EMPLOYEE_HANDLER_CONFIG_MOCK.onboardUtilities.processIncomingEmployees
>[0];

export async function POST(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  const { emails } = (await request.json()) as { emails: string[] };
  const users = (emails ?? []).map(email => ({ email })) as ProcessIncomingArgs;
  await EMPLOYEE_HANDLER_CONFIG_MOCK.onboardUtilities.processIncomingEmployees(
    users,
  );
  return new Response();
}
