import { NextRequest } from 'next/server';
import {
  createServerClient,
  createAdminClient,
} from '../../../../../../libs/supabase-server';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';

const EMAIL_SERVICE_URL = 'https://vb-email-service.fly.dev/send-email';
const SENDER_EMAIL = 'home.management@harryliu.dev';

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.SHARED_APP_TOKEN;
  const res = await fetch(EMAIL_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey ?? '' },
    body: JSON.stringify({ from: SENDER_EMAIL, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Email service error: ${res.status}`);
}

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
  const admin = createAdminClient();

  const [{ data: home }, { data: members, error }] = await Promise.all([
    admin
      .from('homes')
      .select('user_id, created_at')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('home_members')
      .select('id, email, status, role, created_at')
      .eq('home_id', id)
      .order('created_at', { ascending: true }),
  ]);

  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  let ownerEntry = null;
  if (home?.user_id) {
    const { data: ownerUser } = await admin.auth.admin.getUserById(
      home.user_id,
    );
    if (ownerUser?.user) {
      ownerEntry = {
        id: `owner-${home.user_id}`,
        email: ownerUser.user.email ?? '',
        status: 'accepted',
        role: 'HOME_OWNER',
        created_at: home.created_at,
      };
    }
  }

  const list = ownerEntry ? [ownerEntry, ...(members ?? [])] : (members ?? []);
  return Response.json(list);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { email, accessToken } = await request.json();
  const supabase = createServerClient(accessToken);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const normalizedEmail = email.trim().toLowerCase();

  const canManage = user && (await isHomeAdmin(id, user.id));
  const writeClient = canManage ? createAdminClient() : supabase;

  const { error: insertError } = await writeClient.from('home_members').upsert(
    {
      home_id: Number(id),
      email: normalizedEmail,
      invited_by: user?.id,
      invited_by_email: user?.email,
    },
    { onConflict: 'home_id,email' },
  );

  if (insertError) {
    return Response.json(
      { error: insertError.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  try {
    await sendEmail(
      normalizedEmail,
      `You've been invited to a home`,
      `<p>Hi,</p>
<p>You've been invited to join a home by ${user?.email}.</p>
<p><a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/callback">Click here to accept the invite</a></p>`,
    );
  } catch (e) {
    return Response.json(
      { error: (e as Error).message },
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
