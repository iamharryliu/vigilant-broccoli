import { NextRequest } from 'next/server';
import { createServerClient } from '../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

export async function GET(request: NextRequest) {
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const supabase = createServerClient(accessToken);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json([]);

  const { data } = await supabase
    .from('home_members')
    .select('id, home_id, invited_by_email')
    .eq('email', user.email)
    .eq('status', 'pending');

  return Response.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const { homeId, accessToken } = await request.json();
  const supabase = createServerClient(accessToken);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS_CODES.UNAUTHORIZED },
    );

  const { error } = await supabase
    .from('home_members')
    .update({ user_id: user.id, status: 'accepted' })
    .eq('home_id', homeId)
    .eq('email', user.email)
    .eq('status', 'pending');

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json({ success: true });
}
