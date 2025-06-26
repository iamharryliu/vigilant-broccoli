
export type GithubOrganizationTeamStructure = {
  organizationName: string;
  teams: GithubTeam[];
};

export const TEAM_ROLE = {
  MEMBER: 'member',
  MAINTAINER: 'maintainer',
  ADMIN: 'admin',
} as const;

export type TeamRole = typeof TEAM_ROLE[keyof typeof TEAM_ROLE];

export type TeamMember = {
  username: string;
  role: TeamRole;
};
export const REPOSITORY_PERMISSION = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
} as const;

export type RepositoryPermission = typeof REPOSITORY_PERMISSION[keyof typeof REPOSITORY_PERMISSION];

type GithubTeamRepository = {
  name: string;
  permission: RepositoryPermission;
};

export type GithubTeam = {
  name: string;
  members: TeamMember[];
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
