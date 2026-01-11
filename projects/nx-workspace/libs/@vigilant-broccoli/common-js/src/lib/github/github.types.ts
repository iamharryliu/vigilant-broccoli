export type GithubOrgBasic = {
  login: string;
  avatar_url: string;
};

export type GithubOrgMember = {
  login: string;
  id: number;
  html_url: string;
  avatar_url: string;
  repos_url: string;
};

export type GithubOrgRepository = {
  name: string;
  html_url: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
};

export type GithubOrganizationTeamStructure = {
  organizationName: string;
  avatar_url: string;
  memberCount: number;
  members: GithubOrgMember[];
  repositories: GithubOrgRepository[];
  teams: GithubTeam[];
};

export const TEAM_ROLE = {
  MEMBER: 'member',
  MAINTAINER: 'maintainer',
  ADMIN: 'admin',
} as const;

export type TeamRole = (typeof TEAM_ROLE)[keyof typeof TEAM_ROLE];

export type GithubTeamMember = {
  username: string;
  role: TeamRole;
  avatar_url: string;
};

export const REPOSITORY_PERMISSION = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
} as const;

export type RepositoryPermission =
  (typeof REPOSITORY_PERMISSION)[keyof typeof REPOSITORY_PERMISSION];

export type GithubTeamRepository = {
  name: string;
  permission: RepositoryPermission;
};

export type GithubTeam = {
  name: string;
  members: GithubTeamMember[];
  repositories: GithubTeamRepository[];
  teams: GithubTeam[];
};

export type GithubTeamsDTO = {
  name: string;
  id: number;
  node_id: string;
  slug: string;
  description?: string;
  privacy: string;
  notification_setting: string;
  url: string;
  html_url: string;
  members_url: string;
  repositories_url: string;
  permission: string;
  parent?: GithubTeamsDTO;
};
