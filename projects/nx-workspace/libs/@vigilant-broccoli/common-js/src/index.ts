export * from './lib/node-environment/node-environment.consts';
export * from './lib/http/http.consts';
export * from './lib/location/location.model';

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
} as const;

export type FormType = (typeof FORM_TYPE)[keyof typeof FORM_TYPE];

// LLM
export * from './lib/llm/llm.consts';
export * from './lib/llm/llm.types';

// JSON Placeholder
export * from './lib/jsonplaceholder/jsonplaceholder.services';
export * from './lib/jsonplaceholder/jsonplaceholder.types';

// Utils
export * from './lib/utils/env.utils';
export * from './lib/utils/string.utils';

export type GithubOrganizationTeamStructure = {
  organizationName: string;
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
};
export const REPOSITORY_PERMISSION = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
} as const;

export type RepositoryPermission =
  (typeof REPOSITORY_PERMISSION)[keyof typeof REPOSITORY_PERMISSION];

type GithubTeamRepository = {
  name: string;
  permission: RepositoryPermission;
};

export type GithubTeam = {
  name: string;
  members: GithubTeamMember[];
  repositories: GithubTeamRepository[];
  teams: GithubTeam[];
};
