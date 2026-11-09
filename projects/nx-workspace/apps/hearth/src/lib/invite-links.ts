// Mirrors the statuses returned by the redeem_home_invite_link SQL function,
// plus VALID for a preview of a link that can still be redeemed.
export const INVITE_LINK_STATUS = {
  VALID: 'valid',
  JOINED: 'joined',
  REQUESTED: 'requested',
  ALREADY_MEMBER: 'already_member',
  INVALID: 'invalid',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
  EXHAUSTED: 'exhausted',
} as const;

export type InviteLinkStatus =
  (typeof INVITE_LINK_STATUS)[keyof typeof INVITE_LINK_STATUS];

export const INVITE_LINK_DEFAULTS = {
  EXPIRES_IN_DAYS: 7,
  MAX_USES: 10,
} as const;

export const INVITE_LINK_LIMITS = {
  MAX_EXPIRES_IN_DAYS: 30,
  MAX_USES: 100,
} as const;

export const INVITE_LINK_EXPIRY_DAY_OPTIONS = [1, 7, 30] as const;

export type InviteLinkOptions = {
  expiresInDays: number;
  maxUses: number;
  requiresApproval: boolean;
};

export type InviteLink = {
  id: string;
  expires_at: string;
  max_uses: number;
  use_count: number;
  requires_approval: boolean;
  created_at: string;
};

export type CreatedInviteLink = InviteLink & { url: string };

export type InviteLinkPreview = {
  status: InviteLinkStatus;
  homeId?: number;
  homeName?: string;
  inviterName?: string;
  requiresApproval?: boolean;
};

export const INVITE_LINKS_ENDPOINT = (homeId: string | number) =>
  `/api/homes/${homeId}/invite-links`;

export const JOIN_ENDPOINT = (token: string) =>
  `/api/join/${encodeURIComponent(token)}`;

export const JOIN_REQUESTS_ENDPOINT = (homeId: string | number) =>
  `/api/homes/${homeId}/join-requests`;
