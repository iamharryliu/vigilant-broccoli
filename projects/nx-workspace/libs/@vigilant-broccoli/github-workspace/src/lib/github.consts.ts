export const GITHUB_USER_ROLE = {
  MEMBER: 'member',
  ADMIN: 'admin',
} as const;

export type GithubUserRole =
  (typeof GITHUB_USER_ROLE)[keyof typeof GITHUB_USER_ROLE];
