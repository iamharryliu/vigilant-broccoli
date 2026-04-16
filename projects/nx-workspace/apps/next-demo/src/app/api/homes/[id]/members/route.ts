import { NextRequest } from 'next/server';
import {
  createServerClient,
  createAdminClient,
} from '../../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

async function isHomeAdmin(homeId: string, userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('home_members')
    .select('role')
    .eq('home_id', homeId)
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .maybeSingle();
  return data?.role === 'HOME_ADMIN';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken =
    request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const supabase = createServerClient(accessToken);

  const { data, error } = await supabase
    .from('home_members')
    .select('id, email, status, role, created_at')
    .eq('home_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json(data ?? []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { email, accessToken } = await request.json();
  const supabase = createServerClient(accessToken);
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const normalizedEmail = email.trim().toLowerCase();

  const canManage = user && (await isHomeAdmin(id, user.id));
  const writeClient = canManage ? createAdminClient() : supabase;

  const { error: insertError } = await writeClient.from('home_members').insert({
    home_id: Number(id),
    email: normalizedEmail,
    invited_by: user?.id,
    invited_by_email: user?.email,
  });

  if (insertError) {
    return Response.json(
      { error: insertError.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    normalizedEmail,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { home_id: id },
    },
  );

  if (inviteError && inviteError.message !== 'User already registered') {
    return Response.json(
      { error: inviteError.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { memberId, role, accessToken } = await request.json();
  const userClient = createServerClient(accessToken);
  const {
    data: { user },
  } = await userClient.auth.getUser();
  const canManage = user && (await isHomeAdmin(id, user.id));
  const client = canManage ? createAdminClient() : userClient;

  const { error } = await client
    .from('home_members')
    .update({ role })
    .eq('id', memberId)
    .eq('home_id', id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { memberId, accessToken } = await request.json();
  const userClient = createServerClient(accessToken);
  const {
    data: { user },
  } = await userClient.auth.getUser();
  const canManage = user && (await isHomeAdmin(id, user.id));
  const client = canManage ? createAdminClient() : userClient;

  const { error } = await client
    .from('home_members')
    .delete()
    .eq('id', memberId)
    .eq('home_id', id);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  return Response.json({ success: true });
}
