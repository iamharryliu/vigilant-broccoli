import { NextRequest, NextResponse } from 'next/server';
import type { EmployeeHandlerRouteBody } from '@vigilant-broccoli/employee-handler/contract';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { hasUpstream, forwardToUpstream } from '../../../lib/handler-backend';
import {
  createTemplate,
  listTemplates,
} from '../../../lib/signature-templates-store';

export async function GET(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  return NextResponse.json({ templates: listTemplates() });
}

export async function POST(request: NextRequest) {
  if (hasUpstream()) return forwardToUpstream(request);
  const body = (await request.json()) as EmployeeHandlerRouteBody<'signatureTemplatesCreate'>;
  const created = createTemplate(body);
  return NextResponse.json(created, { status: HTTP_STATUS_CODES.CREATED });
}
