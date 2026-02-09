export interface VercelUser {
  email: string;
  role: 'OWNER' | 'MEMBER';
  uid: string;
}

export const VERCEL_USER_ROLE = {
  MEMBER: 'MEMBER',
  OWNER: 'OWNER',
  BILLING: 'BILLING',
} as const;

export type VercelUserRole =
  (typeof VERCEL_USER_ROLE)[keyof typeof VERCEL_USER_ROLE];
