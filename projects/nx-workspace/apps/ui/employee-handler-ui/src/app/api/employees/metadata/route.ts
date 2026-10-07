import { NextRequest, NextResponse } from 'next/server';
import {
  EMPLOYEE_METADATA_KEYS,
  updateEmployeeMetadata,
  type EmployeeMetadata,
} from '@vigilant-broccoli/employee-handler';
import type { EmployeeHandlerRouteBody } from '@vigilant-broccoli/employee-handler/contract';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  hasUpstream,
  forwardToUpstream,
} from '../../../../lib/handler-backend';

const ERROR_EMAIL_REQUIRED = 'email is required';
const ERROR_NOT_FOUND = 'Employee not found';

export async function PATCH(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  const body = (await request.json()) as Partial<
    EmployeeHandlerRouteBody<'employeesMetadata'>
  >;
  if (!body.email) {
    return NextResponse.json(
      { error: ERROR_EMAIL_REQUIRED },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }
  const updates: EmployeeMetadata = {};
  for (const key of EMPLOYEE_METADATA_KEYS) {
    if (key in body) updates[key] = body[key];
  }
  const employee = updateEmployeeMetadata(body.email, updates);
  if (!employee) {
    return NextResponse.json(
      { error: ERROR_NOT_FOUND },
      { status: HTTP_STATUS_CODES.INVALID_PATH },
    );
  }
  return NextResponse.json({ employee });
}
