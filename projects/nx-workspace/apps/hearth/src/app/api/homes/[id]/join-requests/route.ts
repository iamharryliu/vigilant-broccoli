import { NextRequest } from 'next/server';
import { authorizeHomeManager } from '../../../../../../libs/home-access';
import { createAdminClient } from '../../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { MEMBER_ORIGIN, MEMBER_STATUS } from '../../../../../lib/types';

type RouteContext = { params: Promise<{ id: string }> };

const serverError = (message: string) =>
  Response.json(
    { error: message },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

const notFound = () =>
  Response.json(
    { error: 'No pending join request' },
    { status: HTTP_STATUS_CODES.INVALID_PATH },
  );

// Both handlers act on the service-role client after the owner/admin check:
// the requester's own row is outside the approver's RLS write reach for
// non-owners, and the filters pin the change to pending requests only so an
// invited or accepted member can never be touched through here.
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const auth = await authorizeHomeManager(request, id);
  if (auth.error) return auth.error;

  const { memberId } = await request.json();
  const { data, error } = await createAdminClient()
    .from('home_members')
    .update({ status: MEMBER_STATUS.ACCEPTED })
    .eq('id', memberId)
    .eq('home_id', id)
    .eq('status', MEMBER_STATUS.PENDING)
    .eq('origin', MEMBER_ORIGIN.REQUESTED)
    .select('id');
  if (error) return serverError(error.message);
  if (!data?.length) return notFound();

  return Response.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const auth = await authorizeHomeManager(request, id);
  if (auth.error) return auth.error;

  const { memberId } = await request.json();
  const { data, error } = await createAdminClient()
    .from('home_members')
    .delete()
    .eq('id', memberId)
    .eq('home_id', id)
    .eq('status', MEMBER_STATUS.PENDING)
    .eq('origin', MEMBER_ORIGIN.REQUESTED)
    .select('id');
  if (error) return serverError(error.message);
  if (!data?.length) return notFound();

  return Response.json({ success: true });
}
