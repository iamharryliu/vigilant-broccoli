import { NextRequest } from 'next/server';
import {
  createAdminClient,
  createServerClient,
  getBearerToken,
} from '../../../../../../libs/supabase-server';
import {
  generateInviteToken,
  hashInviteToken,
} from '../../../../../../libs/invite-link-token';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { ROUTES } from '../../../../../lib/routes';
import { HOME_ROLE } from '../../../../../lib/types';
import { InviteLink } from '../../../../../lib/invite-links';

const INVITE_LINK_COLUMNS = 'id, expires_at, max_uses, use_count, created_at';

type RouteContext = { params: Promise<{ id: string }> };

// Checked with the admin client for a clear 403; the user-client writes below
// are still bound by the owner/admin RLS policies on home_invite_links.
const canManageInviteLinks = async (homeId: string, userId: string) => {
  const admin = createAdminClient();
  const [{ data: ownedHome }, { data: adminMembership }] = await Promise.all([
    admin
      .from('homes')
      .select('id')
      .eq('id', homeId)
      .eq('user_id', userId)
      .maybeSingle(),
    admin
      .from('home_members')
      .select('id')
      .eq('home_id', homeId)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .eq('role', HOME_ROLE.ADMIN)
      .maybeSingle(),
  ]);
  return Boolean(ownedHome || adminMembership);
};

const authorize = async (request: NextRequest, homeId: string) => {
  const supabase = createServerClient(getBearerToken(request));
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: Response.json(
        { error: 'Unauthorized' },
        { status: HTTP_STATUS_CODES.UNAUTHORIZED },
      ),
    };
  }
  if (!(await canManageInviteLinks(homeId, user.id))) {
    return {
      error: Response.json(
        { error: 'Forbidden' },
        { status: HTTP_STATUS_CODES.FORBIDDEN },
      ),
    };
  }
  return { supabase, user };
};

const serverError = (message: string) =>
  Response.json(
    { error: message },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const auth = await authorize(request, id);
  if (auth.error) return auth.error;

  const { data, error } = await auth.supabase
    .from('home_invite_links')
    .select(INVITE_LINK_COLUMNS)
    .eq('home_id', id)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });
  if (error) return serverError(error.message);

  const active = (data as InviteLink[]).filter(
    link => link.use_count < link.max_uses,
  );
  return Response.json(active);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const auth = await authorize(request, id);
  if (auth.error) return auth.error;

  const token = generateInviteToken();
  const { data, error } = await auth.supabase
    .from('home_invite_links')
    .insert({
      home_id: Number(id),
      token_hash: hashInviteToken(token),
      created_by: auth.user.id,
    })
    .select(INVITE_LINK_COLUMNS)
    .single();
  if (error) return serverError(error.message);

  return Response.json(
    { ...data, url: `${request.nextUrl.origin}${ROUTES.JOIN(token)}` },
    { status: HTTP_STATUS_CODES.CREATED },
  );
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const auth = await authorize(request, id);
  if (auth.error) return auth.error;

  const { linkId } = await request.json();
  const { error } = await auth.supabase
    .from('home_invite_links')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', linkId)
    .eq('home_id', id)
    .is('revoked_at', null);
  if (error) return serverError(error.message);

  return Response.json({ success: true });
}
