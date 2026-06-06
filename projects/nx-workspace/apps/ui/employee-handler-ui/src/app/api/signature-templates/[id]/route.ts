import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import {
  hasUpstream,
  forwardToUpstream,
} from '../../../../lib/handler-backend';
import {
  deleteTemplate,
  updateTemplate,
} from '../../../../lib/signature-templates-store';
import type { SignatureTemplate } from '../../../dashboard/signatures/signatures.shared';

const STATUS_NO_CONTENT = 204;

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (hasUpstream()) return forwardToUpstream(request);
  const { id } = await context.params;
  const body = (await request.json()) as Partial<SignatureTemplate>;
  const updated = updateTemplate(id, body);
  if (!updated) {
    return new NextResponse(null, { status: HTTP_STATUS_CODES.INVALID_PATH });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (hasUpstream()) return forwardToUpstream(request);
  const { id } = await context.params;
  const deleted = deleteTemplate(id);
  if (!deleted) {
    return new NextResponse(null, { status: HTTP_STATUS_CODES.INVALID_PATH });
  }
  return new NextResponse(null, { status: STATUS_NO_CONTENT });
}
