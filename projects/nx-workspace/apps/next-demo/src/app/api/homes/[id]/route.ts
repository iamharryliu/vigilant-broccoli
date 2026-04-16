import { NextRequest } from 'next/server';
import {
  createServerClient,
  createAdminClient,
} from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { name, description, accessToken } = await request.json();
  const userClient = createServerClient(accessToken);

  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );
  }

  const adminClient = createAdminClient();

  const { data: membership } = await adminClient
    .from('home_members')
    .select('role')
    .eq('home_id', id)
    .eq('user_id', user.id)
    .eq('status', 'accepted')
    .maybeSingle();

  const isAdmin = membership?.role === 'HOME_ADMIN';

  const client = isAdmin ? adminClient : userClient;

  const { error } = await client
    .from('homes')
    .update({ name, description })
    .eq('id', id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json({ success: true });
}
