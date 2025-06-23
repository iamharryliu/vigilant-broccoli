
type GithubTeamRole = 'member' | 'maintainer' | 'admin';

export type GithubTeamMember = {
  username: string;
  role: GithubTeamRole;
};

type GithubTeamRepository = {
  name: string;
  permission: 'read' | 'write' | 'admin';
};

export type GithubTeam = {
  name: string;
  members: GithubTeamMember[];
  repositories: GithubTeamRepository[];
  teams: GithubTeam[];
};

export type GithubOrganizationTeamStructure = {
  organizationName: string;
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
