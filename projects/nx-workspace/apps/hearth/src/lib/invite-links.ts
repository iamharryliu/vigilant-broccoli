// Mirrors the statuses returned by the redeem_home_invite_link SQL function,
// plus VALID for a preview of a link that can still be redeemed.
export const INVITE_LINK_STATUS = {
  VALID: 'valid',
  JOINED: 'joined',
  ALREADY_MEMBER: 'already_member',
  INVALID: 'invalid',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
  EXHAUSTED: 'exhausted',
} as const;

export type InviteLinkStatus =
  (typeof INVITE_LINK_STATUS)[keyof typeof INVITE_LINK_STATUS];

export type InviteLink = {
  id: string;
  expires_at: string;
  max_uses: number;
  use_count: number;
  created_at: string;
};

export type CreatedInviteLink = InviteLink & { url: string };

export type InviteLinkPreview = {
  status: InviteLinkStatus;
  homeId?: number;
  homeName?: string;
  inviterName?: string;
};

export const INVITE_LINKS_ENDPOINT = (homeId: string | number) =>
  `/api/homes/${homeId}/invite-links`;

export const JOIN_ENDPOINT = (token: string) =>
  `/api/join/${encodeURIComponent(token)}`;
