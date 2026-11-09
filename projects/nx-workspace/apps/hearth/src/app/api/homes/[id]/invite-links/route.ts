import { NextRequest } from 'next/server';
import { authorizeHomeManager } from '../../../../../../libs/home-access';
import {
  generateInviteToken,
  hashInviteToken,
} from '../../../../../../libs/invite-link-token';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { ROUTES } from '../../../../../lib/routes';
import {
  INVITE_LINK_DEFAULTS,
  INVITE_LINK_LIMITS,
  InviteLink,
} from '../../../../../lib/invite-links';

const INVITE_LINK_COLUMNS =
  'id, expires_at, max_uses, use_count, requires_approval, created_at';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type RouteContext = { params: Promise<{ id: string }> };

type CreateOptions = {
  expiresInDays?: unknown;
  maxUses?: unknown;
  requiresApproval?: unknown;
};

const serverError = (message: string) =>
  Response.json(
    { error: message },
    { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
  );

const isIntegerWithin = (value: unknown, max: number): value is number =>
  Number.isInteger(value) && (value as number) >= 1 && (value as number) <= max;

const parseCreateOptions = ({
  expiresInDays = INVITE_LINK_DEFAULTS.EXPIRES_IN_DAYS,
  maxUses = INVITE_LINK_DEFAULTS.MAX_USES,
  requiresApproval = false,
}: CreateOptions) =>
  isIntegerWithin(expiresInDays, INVITE_LINK_LIMITS.MAX_EXPIRES_IN_DAYS) &&
  isIntegerWithin(maxUses, INVITE_LINK_LIMITS.MAX_USES) &&
  typeof requiresApproval === 'boolean'
    ? { expiresInDays, maxUses, requiresApproval }
    : null;

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const auth = await authorizeHomeManager(request, id);
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
  const auth = await authorizeHomeManager(request, id);
  if (auth.error) return auth.error;

  const options = parseCreateOptions(await request.json().catch(() => ({})));
  if (!options) {
    return Response.json(
      { error: 'Invalid invite link options' },
      { status: HTTP_STATUS_CODES.BAD_REQUEST },
    );
  }

  const token = generateInviteToken();
  const { data, error } = await auth.supabase
    .from('home_invite_links')
    .insert({
      home_id: Number(id),
      token_hash: hashInviteToken(token),
      created_by: auth.user.id,
      expires_at: new Date(
        Date.now() + options.expiresInDays * MS_PER_DAY,
      ).toISOString(),
      max_uses: options.maxUses,
      requires_approval: options.requiresApproval,
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
  const auth = await authorizeHomeManager(request, id);
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
