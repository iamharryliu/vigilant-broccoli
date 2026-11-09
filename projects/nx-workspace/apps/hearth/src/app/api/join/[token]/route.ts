import { NextRequest } from 'next/server';
import { User } from '@supabase/supabase-js';
import {
  createAdminClient,
  createServerClient,
  getBearerToken,
} from '../../../../../libs/supabase-server';
import { hashInviteToken } from '../../../../../libs/invite-link-token';
import { HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { MEMBER_ORIGIN, MEMBER_STATUS } from '../../../../lib/types';
import {
  INVITE_LINK_STATUS,
  InviteLinkPreview,
  InviteLinkStatus,
} from '../../../../lib/invite-links';

type RouteContext = { params: Promise<{ token: string }> };

type LinkRow = {
  home_id: number;
  created_by: string;
  expires_at: string;
  max_uses: number;
  use_count: number;
  requires_approval: boolean;
  revoked_at: string | null;
};

const getUser = async (request: NextRequest) => {
  const {
    data: { user },
  } = await createServerClient(getBearerToken(request)).auth.getUser();
  return user;
};

const unauthorized = () =>
  Response.json(
    { error: 'Unauthorized' },
    { status: HTTP_STATUS_CODES.UNAUTHORIZED },
  );

const getLinkStatus = (link: LinkRow): InviteLinkStatus => {
  if (link.revoked_at) return INVITE_LINK_STATUS.REVOKED;
  if (new Date(link.expires_at) <= new Date())
    return INVITE_LINK_STATUS.EXPIRED;
  if (link.use_count >= link.max_uses) return INVITE_LINK_STATUS.EXHAUSTED;
  return INVITE_LINK_STATUS.VALID;
};

const isMemberOrOwner = async (
  homeId: number,
  userId: string,
): Promise<boolean> => {
  const admin = createAdminClient();
  const [{ data: ownedHome }, { data: membership }] = await Promise.all([
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
      .maybeSingle(),
  ]);
  return Boolean(ownedHome || membership);
};

// Requested rows always carry the requester's user_id (set by the redeem function).
const hasPendingRequest = async (
  homeId: number,
  userId: string,
): Promise<boolean> => {
  const { data } = await createAdminClient()
    .from('home_members')
    .select('id')
    .eq('home_id', homeId)
    .eq('user_id', userId)
    .eq('status', MEMBER_STATUS.PENDING)
    .eq('origin', MEMBER_ORIGIN.REQUESTED)
    .limit(1);
  return Boolean(data?.length);
};

const STATUSES_WITH_HOME_DETAILS: InviteLinkStatus[] = [
  INVITE_LINK_STATUS.VALID,
  INVITE_LINK_STATUS.ALREADY_MEMBER,
  INVITE_LINK_STATUS.REQUESTED,
];

const getPreviewStatus = async (
  link: LinkRow,
  user: User,
): Promise<InviteLinkStatus> => {
  if (await isMemberOrOwner(link.home_id, user.id)) {
    return INVITE_LINK_STATUS.ALREADY_MEMBER;
  }
  if (await hasPendingRequest(link.home_id, user.id)) {
    return INVITE_LINK_STATUS.REQUESTED;
  }
  return getLinkStatus(link);
};

const getInviterName = (inviter: User | null) =>
  inviter?.user_metadata?.display_name ?? inviter?.email;

const getHomeDetails = async (link: LinkRow) => {
  const admin = createAdminClient();
  const [{ data: home }, { data: inviter }] = await Promise.all([
    admin.from('homes').select('name').eq('id', link.home_id).maybeSingle(),
    admin.auth.admin.getUserById(link.created_by),
  ]);
  return {
    homeId: link.home_id,
    homeName: home?.name,
    inviterName: getInviterName(inviter.user),
    requiresApproval: link.requires_approval,
  };
};

// Read-only by design: chat apps prefetch shared links, so only the explicit
// POST below may join.
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  const user = await getUser(request);
  if (!user) return unauthorized();

  const admin = createAdminClient();
  const { data: link } = await admin
    .from('home_invite_links')
    .select(
      'home_id, created_by, expires_at, max_uses, use_count, requires_approval, revoked_at',
    )
    .eq('token_hash', hashInviteToken(token))
    .maybeSingle<LinkRow>();
  if (!link) {
    return Response.json({
      status: INVITE_LINK_STATUS.INVALID,
    } satisfies InviteLinkPreview);
  }

  const status = await getPreviewStatus(link, user);
  // Home details are shown only for links that still lead somewhere.
  if (!STATUSES_WITH_HOME_DETAILS.includes(status)) {
    return Response.json({ status } satisfies InviteLinkPreview);
  }

  return Response.json({
    status,
    ...(await getHomeDetails(link)),
  } satisfies InviteLinkPreview);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  const user = await getUser(request);
  if (!user) return unauthorized();

  const { data, error } = await createAdminClient().rpc(
    'redeem_home_invite_link',
    { p_token_hash: hashInviteToken(token), p_user_id: user.id },
  );
  if (error) {
    return Response.json(
      { error: error.message },
      { status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR },
    );
  }

  const { status, home_id } = data as {
    status: InviteLinkStatus;
    home_id?: number;
  };
  const succeeded =
    status === INVITE_LINK_STATUS.JOINED ||
    status === INVITE_LINK_STATUS.REQUESTED ||
    status === INVITE_LINK_STATUS.ALREADY_MEMBER;
  return Response.json(
    { status, homeId: home_id } satisfies InviteLinkPreview,
    {
      status: succeeded
        ? HTTP_STATUS_CODES.OK
        : HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
    },
  );
}
